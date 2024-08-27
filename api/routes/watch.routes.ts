import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getVideoById, toggleDisLikeFromVideo, toggleLikeToVideo } from "../controllers/video.controller";
import { addCommentToVideo, deleteCommentFromVideo, getCommentFromVideo } from "../controllers/comment.controller";

const watchRouter = Router();

watchRouter.get('/:videoId', getVideoById);

watchRouter.use(authMiddleware)
    .get('/:videoId/comments', getCommentFromVideo)
    .post('/:videoId/comments', addCommentToVideo)
    .delete('/:videoId/comments', deleteCommentFromVideo)
    .post('/:videoId/likes', toggleLikeToVideo)
    .post('/:videoId/dislikes', toggleDisLikeFromVideo)
    
export default watchRouter;