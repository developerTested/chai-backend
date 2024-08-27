import { Request, Response, Router } from "express";
import { createLiveStream, playStream, redirectToMediaFile, startStream, stopStream } from "../controllers/liveStream.controller";
import authMiddleware from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest.middleware";
import upload from "../middlewares/muter.middleware";
import { createLiveStreamSchema } from "../schema/videoSchema";

const liveStreamRouter = Router();

/**
 * Live Streaming
 */
liveStreamRouter.post('/stream', authMiddleware, upload.single("thumbnail"), validateRequest(createLiveStreamSchema), createLiveStream)
liveStreamRouter.get('/stream/:key/index.m3u8', playStream);
liveStreamRouter.post('/stream/:key/start', authMiddleware, startStream)
liveStreamRouter.post('/stream/:key/stop', authMiddleware, stopStream)
// Redirect files
liveStreamRouter.get('/stream/:key/:file', redirectToMediaFile);

export default liveStreamRouter;