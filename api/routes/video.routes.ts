import { Router } from "express";
import { createVideo, deleteVideo, getAllVideos, getVideoById, toggleDisLikeFromVideo, toggleLikeToVideo, updateVideo } from "../controllers/video.controller";
import validateRequest from "../middlewares/validateRequest.middleware";
import { createVideoSchema } from "../schema/videoSchema";
import upload from "../middlewares/muter.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import { addCommentToVideo, deleteCommentFromVideo, getCommentFromVideo, updateCommentToVideo } from "../controllers/comment.controller";

const videoRouter = Router();

videoRouter.get("/", getAllVideos)

/**
 * Create a new video
 */
videoRouter.post("/", authMiddleware, upload.fields([
    {
        name: "videoFile",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    },
]), validateRequest(createVideoSchema), createVideo);

// Get Video
videoRouter.get('/:videoId', getVideoById)

// update video
videoRouter.patch('/:videoId', authMiddleware, upload.single("thumbnail"), updateVideo);

videoRouter
    .use(authMiddleware)
    .route("/:videoId")
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);


/**
 * Comments Routes
 */
videoRouter.get('/:videoId/comments', getCommentFromVideo)

// Post a new comment to Video
videoRouter.post('/:videoId/comments', authMiddleware, addCommentToVideo)

// Update a comment to Video
videoRouter.patch('/:videoId/comments', authMiddleware, updateCommentToVideo)

// Delete a Comment from Video
videoRouter.delete('/:videoId/comments', authMiddleware, deleteCommentFromVideo)

/**
 * Like/Dislike Routes
 */
videoRouter.post('/:videoId/like', authMiddleware, toggleLikeToVideo)

videoRouter.post('/:videoId/dislike', authMiddleware, toggleDisLikeFromVideo)

export default videoRouter;