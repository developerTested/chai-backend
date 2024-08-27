import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getPlaylistById, createPlaylist, allPlaylist, deletePlaylist, editPlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from "../controllers/playlist.controller";
import validateRequest from "../middlewares/validateRequest.middleware";
import { playListCreateSchema } from "../schema/playlistSchema";

const playlistRouter = Router();

// Create a new playlist
playlistRouter.get("/", allPlaylist)

// get playlist from id
playlistRouter.get("/:playlistId", getPlaylistById)

playlistRouter.use(authMiddleware)
    .post("/", validateRequest(playListCreateSchema), createPlaylist)
    .patch("/:playlistId", editPlaylist)
    .patch("/:playlistId/video", addVideoToPlaylist)
    .delete("/:playlistId", deletePlaylist)
    .delete("/:playlistId/video", removeVideoFromPlaylist)


export default playlistRouter;