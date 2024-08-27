import { Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import Tweet from "../models/tweets.model";
import tweetPipeline from "../db/pipelines/tweet.pipeline";
import { AUTH_REQUIRED, paginateOptions, TWEET_EXISTS, TWEET_ID_MISSING, TWEET_NOT_FOUND } from "../constants";
import Like from "../models/likes.model";

/**
 * Paginate tweets list
 */
export const allTweet = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const options = {
        ...paginateOptions,
        page,
        limit,
    }

    const tweetList = Tweet.aggregate(tweetPipeline);

    const pagination = await Tweet.aggregatePaginate(tweetList, options);

    return res.json(new ApiResponse(200, pagination, "fetched all tweets"))
})

/**
 * Create a new Tweet
 */
export const createTweet = asyncHandler(async (req: Request, res: Response) => {

    const { content } = req.body

    if (!content) {
        throw new ApiError(404, "Tweet content is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    /**
     * Check if Tweet already exists
     */
    const tweetExists = await Tweet.findOne({
        userId,
        content,
    });

    console.log("Tweet found", tweetExists);


    if (tweetExists) {
        throw new ApiError(409, TWEET_EXISTS);
    }

    /**
     * Create a new Tweet
     */
    const tweet = await Tweet.create({
        userId,
        content
    })

    return res.status(201).json(new ApiResponse(200, {}, "You've posted a Tweet."))
})

/**
 * Edit a Tweet
 */
export const editTweet = asyncHandler(async (req: Request, res: Response) => {

    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) {
        throw new ApiError(404, TWEET_ID_MISSING)
    }

    if (!content) {
        throw new ApiError(404, "Tweet content is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    /**
     * Check if Tweet already exists
     */
    const tweetExists = await Tweet.findById(tweetId)

    if (!tweetExists) {
        throw new ApiError(404, TWEET_NOT_FOUND);
    }

    /**
     * Create a new Tweet
     */
    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        userId,
        content
    }, {
        new: true,
    })

    return res.status(201).json(new ApiResponse(200, tweet, "Tweet has been updated."))
})

/**
 * Delete a Tweet
 */
export const deleteTweet = asyncHandler(async (req: Request, res: Response) => {

    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(404, TWEET_ID_MISSING)
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    /**
     * Check if Tweet already exists
     */
    const tweetExists = await Tweet.findById(tweetId)

    if (!tweetExists) {
        throw new ApiError(404, TWEET_NOT_FOUND);
    }

    /**
     * Delete a new Tweet
     */
    const tweet = await Tweet.findByIdAndDelete(tweetId)

    return res.status(201).json(new ApiResponse(200, {}, "You've deleted a Tweet."))
})

/**
 * Toggle Like of Tweet
 */
export const toggleLikeOfTweet = asyncHandler(async function (req: Request, res: Response) {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(404, TWEET_ID_MISSING)
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const likeExists = await Like.findOne({
        userId,
        tweetId,
        type: "like",
    })

    if (likeExists) {
        await Like.findByIdAndDelete(likeExists._id);
        return res.json(new ApiResponse(200, {}, "You've taken back your like from Tweet."))
    }

    const liked = await Like.create({
        userId,
        tweetId,
        type: "like",
    })

    return res.status(201).json(new ApiResponse(200, {}, "You've liked this Tweet."))
})