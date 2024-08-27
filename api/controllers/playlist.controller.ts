import { Request, Response } from "express";
import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import PlayList from "../models/playlist.model";
import User from "../models/user.model";
import playlistPipeline, { channelPlaylistPipeline } from "../db/pipelines/playlist.pipeline";
import { playListCreateSchemaType } from "../schema/playlistSchema";
import { AUTH_REQUIRED, paginateOptions } from "../constants";

export const allPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const options = {
        ...paginateOptions,
        page,
        limit,
    }

    const playlist = PlayList.aggregate(playlistPipeline);

    const pagination = await PlayList.aggregatePaginate(playlist, options);

    return res.json(new ApiResponse(200, pagination, "fetched playlist"))
})

export const getPlaylistByChannelId = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(404, "username is missing");
    }

    const user = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        ...channelPlaylistPipeline
    ]);

    if (!user?.length) {
        throw new ApiError(404, "There is no playlist by this channel")
    }

    return res.json(new ApiResponse(200, user, "Channel's playlist"))
})


export const getPlaylistById = asyncHandler(async (req: Request, res: Response) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(404, "playlistId is missing");
    }

    const playlistExists = await PlayList.findById(playlistId);

    if (!playlistExists) {
        throw new ApiError(404, "Playlist is not found!")
    }

    const playlist = await PlayList.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        ...playlistPipeline,
    ]);

    return res.json(new ApiResponse(200, playlist, "fetched playlist"))
})


export const createPlaylist = asyncHandler(async (req: Request<{}, {}, playListCreateSchemaType>, res: Response) => {

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const { name, description } = req.body;

    const playlistExists = await PlayList.findOne({
        name
    });

    if (playlistExists) {
        throw new ApiError(400, "Playlist already exists")
    }

    /**
     * Create a new Playlist
     */
    const playlist = await PlayList.create({
        name,
        description,
        channelId: userId
    });


    return res.status(201).json(new ApiResponse(200, playlist, "Playlist has been created"))
})

export const editPlaylist = asyncHandler(async (req: Request, res: Response) => {

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.currentUser._id;
})


export const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(404, "playlistId is missing");
    }

    const playlistExists = await PlayList.findById(playlistId);

    if (!playlistExists) {
        throw new ApiError(404, "Playlist not found!")
    }

    if (String(playlistExists.channelId) !== userId.toString()) {
        throw new ApiError(400, "Unable to delete playlist");
    }

    const deletePlaylist = await PlayList.findByIdAndDelete(playlistId);

    if (!deletePlaylist) {
        throw new ApiError(400, "Unable to delete Playlist")
    }

    return res.json(new ApiResponse(200, {}, "Playlist has been deleted!"))
})

export const addVideoToPlaylist = asyncHandler(async (req: Request, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const { videoId } = req.body;

    const userId = req.currentUser._id;

    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(404, "playlistId is missing");
    }

    const playlistExists = await PlayList.findById(playlistId);

    if (!playlistExists) {
        throw new ApiError(404, "Playlist not found!")
    }

    if (String(playlistExists.channelId) !== userId.toString()) {
        throw new ApiError(400, "Unable to add video to playlist");
    }

    const playlist = await PlayList.findByIdAndUpdate(playlistId, {
        $push: {
            videos: {
                $each: [videoId.toString()]
            }
        }
    });

    if (!playlist) {
        throw new ApiError(400, "Unable to add video to Playlist")
    }

    return res.json(new ApiResponse(200, playlist, "Video has been added to playlist"))
})

export const removeVideoFromPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { playlistId } = req.params;
    const { videoId } = req.body;

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const userId = req.currentUser._id;

    const playlistExists = await PlayList.findById(playlistId)

    if (!playlistExists) {
        throw new ApiError(404, "Playlist not found!")
    }

    if (String(playlistExists.channelId) !== userId.toString()) {
        throw new ApiError(400, "Unable to remove video to playlist");
    }

    const playlist = await PlayList.findByIdAndUpdate(playlistId, {
        $pull: {
            videos: {
                $in: [videoId.toString()]
            }
        }
    });

    if (!playlist) {
        throw new ApiError(400, "Unable to remove video to Playlist")
    }

    return res.json(new ApiResponse(200, playlist, "Video has been removed from playlist"))
})