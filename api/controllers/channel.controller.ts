import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import User from "../models/user.model";
import ApiResponse from "../utils/ApiResponse";
import videoPipeline from "../db/pipelines/video.pipeline";
import { AUTH_REQUIRED } from "../constants";

export const getChannel = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(404, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "channelId",
                as: "videos",
                pipeline: videoPipeline
            }
        },
        {
            $lookup:
            {
                from: "subscribes",
                localField: "_id",
                foreignField: "channelId",
                as: "subscribers",
            }
        },
        {
            $addFields: {
                subscribers: {
                    $size: "$subscribers"
                },
            }
        },
        {
            $project: {
                _id: 1,
                fullName: 1,
                username: 1,
                subscribers: 1,
                avatar: 1,
                coverImage: 1,
                verified: 1,
                videos: 1,
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})



export const isSubscribed = asyncHandler(async function (req: Request, res: Response) {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(404, "username is missing");
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:
            {
                from: "subscribes",
                localField: "_id",
                foreignField: "channelId",
                as: "subscribers",
            }
        },
        {
            $addFields: {
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.currentUser._id, "$subscribers.subscriberId"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                isSubscribed: 1,
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "checking is user subscribed to channel"))

})