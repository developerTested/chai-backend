import { Router } from "express";
import validateRequest from "../middlewares/validateRequest.middleware";
import { getCurrentUser, loginUser, logoutUser, refreshToken, registerUser } from "../controllers/user.controller";
import { loginSchema, registerSchema } from "../schema/authSchema";
import upload from "../middlewares/muter.middleware";
import authMiddleware from "../middlewares/auth.middleware";

const userRouter = Router();

// get current logged in user
userRouter.get("/currentUser", authMiddleware, getCurrentUser)

// Refresh token
userRouter.post('/refreshToken', refreshToken)

// Login routes
userRouter.post('/login', validateRequest(loginSchema), loginUser)

// Logout
userRouter.post('/logout', authMiddleware, logoutUser)

// Register routes

userRouter.post('/register', upload.fields([
    {
        name: 'avatar',
        maxCount: 1,
    },
    {
        name: 'coverImage',
        maxCount: 1
    },
]), validateRequest(registerSchema), registerUser)


export default userRouter;