import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { addSubscribe, getSubscriptions, removeSubscribe } from "../controllers/subscriptions.controller";

const subscriptionRouter = Router();

// Add auth middleware to all routes
subscriptionRouter.use(authMiddleware)

subscriptionRouter.get("/", getSubscriptions)

subscriptionRouter.post("/", addSubscribe)
subscriptionRouter.delete("/", removeSubscribe)

export default subscriptionRouter;