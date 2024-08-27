import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest.middleware";
import upload from "../middlewares/muter.middleware";
import { changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/profile.controller";
import { changePasswordSchema, updateUserSchema } from "../schema/authSchema";

const profileRouter = Router();

// Add auth middleware to all routes
profileRouter.use(authMiddleware)

// Change user password
profileRouter.post("/changePassword", validateRequest(changePasswordSchema), changeCurrentPassword)

// update avatar
profileRouter.patch("/avatar", upload.single("avatar"), updateUserAvatar)

// update cover image
profileRouter.patch("/coverImage", upload.single("coverImage"), updateUserCoverImage)

// update account details
profileRouter.patch("/updateAccount", validateRequest(updateUserSchema), updateAccountDetails)

export default profileRouter;