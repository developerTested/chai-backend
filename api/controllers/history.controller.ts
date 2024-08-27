import { Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import History from "../models/history.model";
import { AUTH_REQUIRED, paginateOptions } from "../constants";
import videoPipeline from "../db/pipelines/video.pipeline";

/**
 * Get all histories for user
 */
export const getAllHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page, limit, sortBy } = req.query;

    const options = {
        ...paginateOptions,
        page,
        limit,
    }

    const userId = req.currentUser._id;

    const historyList = History.aggregate([
        {
            $match: {
                userId,
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videoId",
                foreignField: "_id",
                as: "video",
                pipeline: videoPipeline
            }
        },
        {
            $unwind: {
                path: "$video"
            }
        },
        {
            $project: {
                userId: 1,
                video: 1,
                createdAt: 1,
            }
        },
    ]);

    const pagination = await History.aggregatePaginate(historyList, options);

    return res.json(new ApiResponse(200, pagination, "Retrieved all videos you have watched"))
})

/**
 * Add new Video to History
 */
export const createHistory = asyncHandler(async (req: Request, res: Response) => {

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.currentUser._id;

    const { videoId } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    // Check video in the watch history
    const historyExists = await History.find({
        videoId,
        userId
    });


    if (historyExists.length) {
        throw new ApiError(409, "Video already in watch history")
    }

    // Remove video from History
    const history = await History.create({
        videoId,
        userId,
        type: "watch"
    })

    return res.status(201).json(new ApiResponse(200, {}, "Video has been added to watch history"))
})


/**
 * Remove Video to History
 */
export const deleteHistory = asyncHandler(async (req: Request, res: Response) => {

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const { videoId } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    // Check video in the watch history
    const historyExists = await History.find({
        videoId,
        userId
    })


    if (!historyExists.length) {
        throw new ApiError(409, "Video not found in the watch history")
    }

    // Remove video from History
    const history = await History.deleteMany({
        videoId,
        userId,
    })

    return res.status(201).json(new ApiResponse(200, {}, "Video has been removed from watch history"))
})