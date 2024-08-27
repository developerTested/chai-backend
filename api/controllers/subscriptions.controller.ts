import { Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import User from "../models/user.model";
import Subscribe from "../models/subscribe.model";
import { AUTH_REQUIRED } from "../constants";


export const getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const subscribe = await Subscribe.aggregate([
        {
            $match: {
                subscriberId: req.currentUser._id
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channelId",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: {
                path: "$channel",
            }
        },
        {
            $project: {
                channel: {
                    _id: 1,
                    fullName: 1,
                    avatar: 1,
                    verified: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            }
        }
    ]);

    if (!subscribe?.length) {
        throw new ApiError(404, "You've not subscribed to any channel yet.")
    }

    return res.json(new ApiResponse(200, subscribe[0], "Fetched all subscriptions"))

});


export const addSubscribe = asyncHandler(async (req: Request, res: Response) => {
    const { channelId } = req.body;

    if (!channelId) {
        throw new ApiError(404, "Invalid Channel");
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found!");
    }

    const checkSubscribeExists = await Subscribe.find({
        channelId: channel._id,
        subscriberId: userId,
    });

    if (checkSubscribeExists.length) {
        throw new ApiError(400, "You've already subscribe to channel")
    }

    const subscription = await Subscribe.create({
        channelId: channel._id,
        subscriberId: userId,
    });


    if (!subscription) {
        throw new ApiError(500, "Unable to subscribe to channel")
    }

    return res.json(new ApiResponse(200, {}, "Channel subscribed"));
})


export const removeSubscribe = asyncHandler(async (req: Request, res: Response) => {
    const { channelId } = req.body;

    if (!channelId) {
        throw new ApiError(404, "Invalid Channel");
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found!");
    }

    const subscription = await Subscribe.deleteMany({
        channelId: channel._id,
        subscriberId: userId,
    });

    if (!subscription) {
        throw new ApiError(500, "Unable to unsubscribe to channel")
    }

    return res.json(new ApiResponse(200, {}, "Channel unsubscribed"));
})