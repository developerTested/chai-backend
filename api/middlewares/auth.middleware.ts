import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError";
import User from "../models/user.model";
import { AUTH_FAILED, AUTH_REQUIRED } from "../constants";
import { IUser } from "../types/authTypes";
import asyncHandler from "../utils/asyncHandler";

const authMiddleware = asyncHandler(async (req: Request, _, next: NextFunction) => {

    const token = req.cookies.accessToken || req.headers.authorization?.replace("Bearer ", "")?.trim();


    if (!token) {
        throw new ApiError(401, AUTH_REQUIRED)
    }

    try {

        const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || ""

        const decodeToken = jwt.verify(token, ACCESS_TOKEN_SECRET) as IUser

        if (!decodeToken) {
            throw new ApiError(401, AUTH_FAILED);
        }

        const user = await User.findById(decodeToken._id).select(['-password', '-refreshToken'])

        if (!user) {
            throw new ApiError(401, AUTH_FAILED);
        }

        req.currentUser = user;

        next()

    } catch (error) {
        next(error);
    }
})

export default authMiddleware