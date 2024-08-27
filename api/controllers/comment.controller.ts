import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import Comment from "../models/comments.model";
import ApiResponse from "../utils/ApiResponse";
import commentPipeline from "../db/pipelines/comment.pipeline";
import mongoose from "mongoose";
import Like from "../models/likes.model";
import { AUTH_REQUIRED, paginateOptions } from "../constants";

/**
 * Get all comments
 */
export const getAllComments = asyncHandler(async function (req: Request, res: Response) {
    const { page, limit } = req.query;

    const options = {
        ...paginateOptions,
        page,
        limit,
    }
    
    const commentList = Comment.aggregate(commentPipeline);

    const pagination = await Comment.aggregatePaginate(commentList, options);

    return res.json(new ApiResponse(200, pagination, "Fetched all Comments"))
})

/**
 * Retrieve all comments of a video
 */
export const getCommentFromVideo = asyncHandler(async function (req: Request, res: Response) {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "Video id is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const commentList = await Comment.aggregate([
        {
            $match: {
                videoId: new mongoose.Types.ObjectId(videoId)
            }
        },
        ...commentPipeline
    ]);

    if (!commentList.length) {
        throw new ApiError(404, "No comment yet.")
    }

    return res.json(new ApiResponse(200, commentList[0], "Retrieved all comments from Video"))
})

/**
 * Add a new comment to a Video
 */
export const addCommentToVideo = asyncHandler(async function (req: Request, res: Response) {
    const { videoId } = req.params;

    const { content } = req.body;

    if (!videoId) {
        throw new ApiError(404, "Video id is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    if (!content) {
        throw new ApiError(400, "Comment content is required")
    }

    const userId = req.currentUser._id;

    /**
     * Check if comment exists
     */
    const commentExists = await Comment.findOne({
        videoId,
        userId,
        content
    })

    if (commentExists) {
        throw new ApiError(409, "Comment already exists");
    }

    /**
     * Create a new Comment
     */
    const commentItem = await Comment.create({
        videoId,
        userId,
        content
    });

    return res.status(201).json(new ApiResponse(200, commentItem, "You've commented on this video"))
})

/**
 * Update comment 
 */
export const updateCommentToVideo = asyncHandler(async function (req: Request, res: Response) {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "Video id is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }
})

/**
 * Remove a comment from a Video
 */
export const deleteCommentFromVideo = asyncHandler(async function (req: Request, res: Response) {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "Video id is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }
})

/**
 * Like Comment
 */
export const addLikeToComment = asyncHandler(async function (req: Request, res: Response) {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(404, "Video id is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const likeExists = await Like.findOne({
        userId,
        commentId,
        type: "like",
    })

    if (likeExists) {
        await Like.findByIdAndDelete(likeExists._id);

        return res.json(new ApiResponse(200, {}, "You've taken back your like from comment."))
    }

    const liked = await Like.create({
        userId,
        commentId,
        type: "like",
    })

    return res.status(201).json(new ApiResponse(200, {}, "You've liked this comment."))
})

/**
 * Dislike Comment
 */
export const deleteLikeFromComment = asyncHandler(async function (req: Request, res: Response) {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(404, "Video id is missing!")
    }

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const dislikeExists = await Like.findOne({
        userId,
        commentId,
        type: "dislike",
    })

    if (dislikeExists) {
        await Like.findByIdAndDelete(dislikeExists._id);

        return res.json(new ApiResponse(200, {}, "You've taken back your dislike from comment."))
    }

    const liked = await Like.create({
        userId,
        commentId,
        type: "dislike",
    })

    return res.status(201).json(new ApiResponse(200, {}, "You've disliked this comment."))
})