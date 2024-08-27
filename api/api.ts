import express, { NextFunction, Request, Response } from "express"
import path from "path"
import cors from "cors"
import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import cookieParser from "cookie-parser"
import connectDB from "./db";
import ApiError from "./utils/ApiError"
import { channelRouter, historyRouter, watchRouter, userRouter, videoRouter, subscriptionRouter, profileRouter, playlistRouter, commentRouter, liveStreamRouter } from "./routes"
import { getAllVideos, searchVideos } from "./controllers/video.controller"
import NodeMediaServer from "node-media-server"
import { rtmpConfig, rtmpMediaOutDir, rtmpOutDir } from "./constants"

/**
 * Load environment variables
 */
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

export const ORIGIN_HOSTS = process.env.ORIGIN_HOSTS || '*'
export const port = process.env.PORT as unknown as number || 3001
export const HOST_NAME = process.env.HOST_NAME || '127.0.0.1'

/**
 * Connect to database
 */
connectDB()

/**
 * Express initialize
 */
export const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser())

app.use(cors({
    origin: ORIGIN_HOSTS,
    credentials: true,
    optionsSuccessStatus: 200,
}));

/**
 * Create Directories for RTMPS
*/
export const recordingsDir = path.join(__dirname, "..", rtmpMediaOutDir);
export const recordingsOutputDir = path.join(__dirname, "..", rtmpOutDir);

/**
 * RTMPS
 */
export const nms = new NodeMediaServer(rtmpConfig)

nms.run();

/**
 * Routes
 */
const createVersionRoute = (route: string, version = 'v1') => "/api/" + version + "/" + route;

app.get('/', (_req: Request, res: Response) => {
    return res.send('Express Typescript on Vercel')
})

app.get('/ping', (_req: Request, res: Response) => {
    return res.send('pong 🏓')
})

// Home
app.get(createVersionRoute("/"), getAllVideos)

app.get(createVersionRoute("search"), searchVideos)

// History
app.use(createVersionRoute("history"), historyRouter)

// Video
app.use(createVersionRoute("videos"), videoRouter)

// Live Stream
// app.use(createVersionRoute("live"), liveStreamRouter)

// Subscriptions
app.use(createVersionRoute("subscriptions"), subscriptionRouter)

// Watch
app.use(createVersionRoute("watch"), watchRouter)

// Auth
app.use(createVersionRoute("auth"), userRouter)

// Profile
app.use(createVersionRoute("account"), profileRouter)

// Channels
app.use(createVersionRoute("channel"), channelRouter)

// Playlist
app.use(createVersionRoute("playlist"), playlistRouter)

// Comments
app.use(createVersionRoute("comments"), commentRouter)

/**
 * Error Handing
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("An error", err);

    if (err?.statusCode) {
        return res.status(err.statusCode || 500).json(err);
    }

    return res.status(err.statusCode || 500).json(new ApiError(err.statusCode || 500, "An error occurred", err.message))
})

/**
 * 404 errors
 */
app.use("*", function (req: Request, res: Response) {
    return res.status(404).json(new ApiError(404, "Page not found"))
})