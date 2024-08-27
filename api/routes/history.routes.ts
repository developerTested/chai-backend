import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { createHistory, deleteHistory, getAllHistory } from "../controllers/history.controller";

const historyRouter = Router();

// Add auth middleware to all routes
historyRouter.use(authMiddleware)

// fetch all history search or watched videos
historyRouter.get("/", getAllHistory)

// Create history
historyRouter.post("/", createHistory)

// Delete History
historyRouter.delete("/", deleteHistory)

export default historyRouter;