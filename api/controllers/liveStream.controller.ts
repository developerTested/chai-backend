import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import Video from "../models/video.model";
import { nms, recordingsDir, recordingsOutputDir } from "../api";
import asyncHandler from "../utils/asyncHandler";
import { AUTH_REQUIRED, rtmpOutDir } from "../constants";
import { uploadToCloudinary } from "../utils/cloudinary";

const activeStreams: any = {};

export function redirectToMediaFile(req: Request, res: Response) {
    const streamKey = req.params.key;

    const file = req.params.file;

    if (!streamKey) {
        return res.status(404).json(new ApiError(404, "Stream not found!"));
    }

    if (!file) {
        return res.status(404).json(new ApiError(404, "Media file not found!"));
    }

    const filePath = path.join(recordingsDir, streamKey, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json(new ApiError(404, "Media file not found!"));
    }

    // Read the index.m3u8 file
    let indexFileContent = fs.readFileSync(filePath);

    // Serve the modified index.m3u8 file
    res.setHeader('Content-Type', 'video/MP2T');

    return res.send(indexFileContent);
}

/**
 * Create Live Stream
 */
export const createLiveStream = asyncHandler(async (req: Request, res: Response) => {

    const { title, description, duration, scheduledAt } = req.body

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const channelId = req.currentUser._id;

    /**
     * Check if video exists
     */
    const videoExists = await Video.findOne({
        title,
        liveStream: true,
    });

    // check user exists
    if (videoExists) {
        throw new ApiError(409, "Video already exists")
    }

    /**
     * Check thumbnail
     */
    if (!req.file?.path) {
        throw new ApiError(400, "Thumbnail is required");
    }


    const thumbnailLocalPath = req.file.path;


    const thumbnail = await uploadToCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(500, "Unable to upload thumbnail")
    }

    const video = await Video.create({
        title,
        description,
        duration,
        videoFile: " ",
        thumbnail: thumbnail.url,
        liveStream: true,
        scheduledAt,
        channelId,
    });

    return res.status(201).json(new ApiResponse(200, video, "Live Stream created!"));
})

/**
 * Start Stream
 */
export function startStream(req: Request, res: Response) {
    const streamKey = req.params.key;

    if (!streamKey) {
        return res.status(404).json(new ApiError(404, "Stream not found!"));
    }

    const folderPath = path.join(recordingsDir, streamKey);
    const filePath = path.join(recordingsDir, streamKey, 'index.m3u8');

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    try {
        // Generate HLS playlist and segments using FFmpeg
        ffmpeg(`rtmp://localhost/live/${streamKey}`)
            .addOptions([
                '-c:v copy',
                '-c:a aac',
                '-f hls',
                '-hls_time 25',
                '-hls_playlist_type event', // or 'vod' for video on demand
            ])
            .output(filePath)
            .on('start', (cmd) => {
                console.log('FFmpeg process started:', cmd);
            })
            .on('end', () => {
                console.log('Streaming ended');
                return res.sendFile(filePath); // Serve the generated HLS playlist to client
            })
            .on('error', (err, stdout, stderr) => {
                console.error('Error:', err);
                console.error('ffmpeg stderr:', stderr);
                return res.status(500).json(new ApiError(500, "Failed to start streaming"));
            })
            .run();
    } catch (error) {
        console.error('Caught exception:', error);
        return res.status(500).json(new ApiError(500, "Internal server error"))
    }

    return res.status(201).json(new ApiResponse(200, `Streaming started for ${streamKey}`));
}

/**
 * Save Stream
 */
export const stopStream = asyncHandler(async (req: Request, res: Response) => {
    const streamKey = req.params.key;

    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const channelId = req.currentUser._id;

    if (!streamKey) {
        return res.status(404).json(new ApiError(404, "Stream not found!"));
    }

    const fileName = `${streamKey}.mp4`;

    const folderPath = path.join(recordingsOutputDir);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = `${folderPath}/${fileName}`;

    let videoFile = null;

    nms.stop();

    const videoId = streamKey;

    if (!fs.existsSync(filePath)) {
        throw new ApiError(404, "Stream not found!")
    }

    if (!videoFile) {
        throw new ApiError(500, "video file is missing!")
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        channelId,
        videoFile,
    }, {
        new: true
    }).select(["-__v"])

    delete activeStreams[streamKey];


    return res.status(200).json({ message: 'Stream stop successfully' });
});

export function playStream(req: Request, res: Response) {
    const streamKey = req.params.key;

    if (!streamKey) {
        return res.status(404).json(new ApiError(404, "Stream key is missing!"));
    }

    const folderPath = path.join(recordingsDir, streamKey);
    const filePath = path.join(recordingsDir, streamKey, 'index.m3u8');

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).json(new ApiError(404, "Stream not found!"));
    }

    // Read the index.m3u8 file
    let indexFileContent = fs.readFileSync(filePath, 'utf8');

    // Serve the modified index.m3u8 file
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    return res.send(indexFileContent);
}