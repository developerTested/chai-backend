import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getChannel, isSubscribed } from "../controllers/channel.controller";
import { allTweet, createTweet, deleteTweet, editTweet } from "../controllers/tweet.controller";
import { getPlaylistByChannelId } from "../controllers/playlist.controller";
import { getAllVideos } from "../controllers/video.controller";
import tweetRouter from "./tweets.routes";

const channelRouter = Router();

// Chanel route
channelRouter.get('/:username', getChannel);

// Channel subscribed check
channelRouter.get('/:username/subscribed', authMiddleware, isSubscribed);

// Playlist
channelRouter.get('/:username/playlist', getPlaylistByChannelId);

// Videos
channelRouter.get('/:username/videos', getAllVideos);

// Tweets
channelRouter.use('/:username/tweets', tweetRouter);


export default channelRouter;