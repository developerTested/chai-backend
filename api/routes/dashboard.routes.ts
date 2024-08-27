import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";

const dashboardRouter = Router();

// Add auth middleware to all routes
dashboardRouter.use(authMiddleware)



export default dashboardRouter;