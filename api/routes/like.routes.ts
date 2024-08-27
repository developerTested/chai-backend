import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";

const likeRouter = Router();

// Add auth middleware to all routes
likeRouter.use(authMiddleware)



export default likeRouter;