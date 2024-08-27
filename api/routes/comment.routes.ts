import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { addLikeToComment, deleteCommentFromVideo, deleteLikeFromComment, getAllComments, getCommentFromVideo, updateCommentToVideo } from "../controllers/comment.controller";

const commentRouter = Router();

// Add auth middleware to all routes
commentRouter.use(authMiddleware)

// get all comments
commentRouter.get('/', getAllComments)

// Get Comment
commentRouter.get('/:commentId', getCommentFromVideo)

// Post comment to video
commentRouter.post('/:commentId/like', addLikeToComment)

// Update comment to video
commentRouter.post('/:commentId/dislike', deleteLikeFromComment)

// Delete comment
commentRouter.delete('/:commentId', deleteCommentFromVideo)

export default commentRouter;