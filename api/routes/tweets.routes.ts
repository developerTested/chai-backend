import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { allTweet, createTweet, deleteTweet, editTweet, toggleLikeOfTweet } from "../controllers/tweet.controller";

const tweetRouter = Router();

tweetRouter.get('/', allTweet);

tweetRouter.use(authMiddleware)
    .post('/', createTweet)
    .patch('/status/:tweetId', editTweet)
    .delete('/status/:tweetId', deleteTweet)
    .post('/status/:tweetId/like', toggleLikeOfTweet)
    
export default tweetRouter;