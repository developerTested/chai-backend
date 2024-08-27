import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import Video from "../models/video.model";
import Like from "../models/likes.model";
import videoPipeline from "../db/pipelines/video.pipeline";
import commentPipeline from "../db/pipelines/comment.pipeline";
import { createVideoSchemaType } from "../schema/videoSchema";
import { deleteFileFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";
import { AUTH_REQUIRED, paginateOptions } from "../constants";
import { recordingsDir } from "../api";

type fileTypes = {
    videoFile: Express.Multer.File[],
    thumbnail: Express.Multer.File[],
}


/**
 * Search
 */
type searchType = {
    page: number,
    title: string,
    sortBy: string,
    sortType: string,
    limit: number
}

export async function searchVideos(req: Request<{}, {}, {}, searchType>, res: Response) {
    const { page, limit = "", title = " ", sortBy = "asc", sortType = "title" } = req.query;

    const options = {
        ...paginateOptions,
        page,
        limit,
    }

    const keywordsArray = title?.split(' ');

    const query = {
        $or: keywordsArray.flatMap(keyword => [
            { title: { $regex: keyword, $options: 'i' } }, // Case-insensitive search for keyword in title
            // { description: { $regex: keyword, $options: 'i' } } // Case-insensitive search for keyword in description
        ])
    };

    const videoList = Video.aggregate([
        {
            $match: query,
        },
        ...videoPipeline,
    ]);

    const pagination = await Video.aggregatePaginate(videoList, options);

    return res.json(new ApiResponse(200, pagination, "Fetched all videos"))
}

/**
 * Get all videos
 */
export async function getAllVideos(req: Request, res: Response) {
    const { page, limit } = req.query;

    const options = {
        ...paginateOptions,
        page,
        limit,
    }

    const videoList = Video.aggregate(videoPipeline);

    const pagination = await Video.aggregatePaginate(videoList, options);

    return res.json(new ApiResponse(200, pagination, "Fetched all videos"))
}

/**
 * Get Video by id
 */
export const getVideoById = asyncHandler(async (req: Request, res: Response) => {
    const videoId = req.params.videoId;

    if (!videoId) {
        throw new ApiError(400, "VideoId is required")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        ...videoPipeline,
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "videoId",
                as: "comments",
                pipeline: commentPipeline,
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "videoId",
                pipeline: [
                    {
                        $group: {
                            _id: null, // Group all documents together
                            like: { $sum: { $cond: { if: { $eq: ["$type", "like"] }, then: 1, else: 0 } } }, // Count likes
                            dislike: { $sum: { $cond: { if: { $eq: ["$type", "dislike"] }, then: 1, else: 0 } } } // Count dislikes
                        }
                    },
                    {
                        $project: {
                            _id: 0, // Exclude _id field
                            like: 1,
                            dislike: 1
                        }
                    }
                ],
                as: "stats",
            },
        },
        {
            $unwind: {
                path: "$channel",
            }
        },
        {
            $unwind: {
                path: "$stats",
                preserveNullAndEmptyArrays: true,
            }
        }
    ])

    if (!video?.length) {
        throw new ApiError(404, "Video does not exists")
    }

    const videoInfo = video[0]

    /**
     * Update Views
     */
    await Video.findByIdAndUpdate(videoInfo._id, {
        $inc: {
            views: 1
        }
    },
        { new: true }
    )

    const videoData = {
        ...videoInfo,
        suggestions: await recommendVideos(videoInfo.channel._id, 20, videoInfo.title)
    }

    return res.json(new ApiResponse(200, videoData, "Retrieved video from an ID"));
})

/**
 * Create a new video
 */
export const createVideo = asyncHandler(async (req: Request<{}, {}, createVideoSchemaType>, res: Response) => {

    const { title, description, duration } = req.body

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const channelId = req.currentUser._id;

    /**
     * Check if video exists
     */
    const videoExists = await Video.findOne({
        title
    });

    // check user exists
    if (videoExists) {
        throw new ApiError(409, "Video already exists")
    }

    /**
    * Check videoFile and thumbnail
    */
    const files = req.files;

    const fileData = JSON.parse(JSON.stringify(files)) as fileTypes;

    if (!(fileData.videoFile || fileData.thumbnail)) {
        throw new ApiError(400, "videoFile and thumbnail are required")
    }

    const videoFile = await uploadToCloudinary(fileData.videoFile[0].path)

    if (!videoFile) {
        throw new ApiError(500, "Unable to upload videoFile")
    }

    const thumbnail = await uploadToCloudinary(fileData.thumbnail[0].path)

    if (!thumbnail) {
        throw new ApiError(500, "Unable to upload thumbnail")
    }

    const video = await Video.create({
        title,
        description,
        duration,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        channelId,
    })

    video.__v = undefined

    return res.status(201).json(new ApiResponse(200, video, "Video created!"));
})

/**
 * Update video details
 */
export const updateVideo = asyncHandler(async (req: Request, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const channelId = req.currentUser._id;

    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "VideoId is required")
    }

    const thumbnailLocalPath = req.file;
    const { title, description } = req.body;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    /**
     * Upload thumbnail
     */
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath.path);

    if (!thumbnail) {
        throw new ApiError(500, "Unable to upload Thumbnail")
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        thumbnail: thumbnail.url,
        channelId,
    }, {
        new: true
    }).select(["-__v"])

    return res.json(new ApiResponse(200, video, "Video has been updated"));
})

/**
 * Delete a video with its files
 */
export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
    const videoId = req.params.videoId;

    if (!videoId) {
        throw new ApiError(400, "VideoId is required")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    /**
     * Find Video using its id
     */
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found!")
    }

    /**
     * Check video owner is currentUser
     */
    if (String(video.channelId) !== userId.toString()) {
        throw new ApiError(400, "Unable to delete video")
    }

    /**
     * Delete video file and thumbnail
     */
    const videoFileName = video.videoFile;
    const thumbnailFileName = video.thumbnail;

    const deleteVideoFile = await deleteFileFromCloudinary(videoFileName, "video");

    if (!deleteVideoFile) {
        throw new ApiError(500, "Unable to delete video file")
    }

    const deleteThumbnailFile = await deleteFileFromCloudinary(thumbnailFileName);

    if (!deleteThumbnailFile) {
        throw new ApiError(500, "Unable to delete thumbnail file")
    }

    /**
     * Find Video and delete it
     */
    const response = await Video.findByIdAndDelete(video._id);
    if (!response) {
        throw new ApiError(500, "Unable to delete video");
    }

    return res.status(200).json(new ApiResponse(204, "Video has been deleted successfully!"));
})


async function recommendVideos(channelId: string, limit = 10, title: string = "") {

    try {
        const recommendedVideos = await Video.aggregate([
            {
                $match: {
                    $or: [
                        { channelId }, // Include videos from the specified channel
                        { title: { $ne: title } } // Exclude videos from the specified title
                    ],
                    description: { $regex: title, $options: 'i' } // Case-insensitive search in description
                }
            },
            ...videoPipeline,
            { $limit: limit } // Limit the number of documents returned
        ])

        return recommendedVideos;
    } catch (err) {
        console.error('Error recommending videos:', err);
        throw err;
    }
}

/**
 * Like Video
 */
export const toggleLikeToVideo = asyncHandler(async function (req: Request, res: Response) {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "Video id is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const likeExists = await Like.findOne({
        userId,
        videoId,
        type: "like",
    })

    if (likeExists) {
        await Like.findByIdAndDelete(likeExists._id);

        return res.json(new ApiResponse(200, {}, "You've taken back your like from video."))
    }

    const liked = await Like.create({
        userId,
        videoId,
        type: "like",
    })

    return res.status(201).json(new ApiResponse(200, {}, "You've liked this video."))
})


/**
 * Dislike Video
 */
export const toggleDisLikeFromVideo = asyncHandler(async function (req: Request, res: Response) {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "Video id is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const dislikeExists = await Like.findOne({
        userId,
        videoId,
        type: "dislike",
    })

    if (dislikeExists) {
        await Like.findByIdAndDelete(dislikeExists._id);

        return res.json(new ApiResponse(200, {}, "You've taken back your dislike from video."))
    }

    const liked = await Like.create({
        userId,
        videoId,
        type: "dislike",
    })

    return res.status(201).json(new ApiResponse(200, {}, "You've disliked this video."))
})