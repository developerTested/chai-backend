import { Request, Response } from "express";
import { loginType, registerType, updateUserType } from "../schema/authSchema";
import { AUTH_FAILED, AUTH_REQUIRED, USER_EXISTS } from "../constants";
import { IUser, UserRequest } from "../types/authTypes";
import { uploadToCloudinary } from "../utils/cloudinary";
import { generateTokens } from "../utils/helper";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

type fileTypes = {
    avatar: Express.Multer.File[],
    coverImage: Express.Multer.File[]
}

const options = {
    httpOnly: true,
    secure: true,
}

/**
 * Get current logged in User details
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const user = await User.findById(req.currentUser?._id).select(["-password", "-refreshToken", "-__v", "-watchHistory"])

    if (!user) {
        throw new ApiError(401, AUTH_FAILED)
    }

    return res.json(new ApiResponse(200, user))
})

/**
 * Create an account
 */
export const registerUser = asyncHandler(async (req: UserRequest<{}, {}, registerType>, res: Response) => {

    const { email, password, fullName, username } = req.body;

    /**
     * Check user exists
     */
    const userExists = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (userExists) {
        throw new ApiError(409, USER_EXISTS)
    }

    /**
     * Check avatar and coverImage
     */
    const files = req.files;

    const fileData = JSON.parse(JSON.stringify(files)) as fileTypes;

    if (fileData.avatar[0].originalname === fileData.coverImage[0].originalname) {
        throw new ApiError(400, "Avatar and Cover image can't be same.")
    }

    const avatar = await uploadToCloudinary(fileData.avatar[0].path)

    if (!avatar) {
        throw new ApiError(500, "Unable to upload avatar")
    }

    const coverImage = await uploadToCloudinary(fileData.coverImage[0].path)

    if (!coverImage) {
        throw new ApiError(500, "Unable to upload cover image")
    }

    // Create an account
    const user = await User.create({
        email,
        username: username.toLowerCase(),
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage.url,
    });

    if (!user) {
        throw new ApiError(500, "Unable to register your account.")
    }

    const createdUser = await User.findById(user._id).select(["-password", "-refreshToken", "-__v", "-watchHistory"])

    return res.status(201).json(new ApiResponse(200, createdUser, "Your account has been registered successfully"))
});

/**
 * Login into an account
 */
export const loginUser = asyncHandler(async (req: Request<{}, {}, loginType>, res: Response) => {

    const { email, password } = req.body;

    // Get user by email
    const user = await User.findOne({
        email
    });

    if (!user) {
        throw new ApiError(401, AUTH_FAILED);
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, AUTH_FAILED);
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(["-password", "-refreshToken", "-__v", "-watchHistory"])

    return res.status(200).
        cookie('accessToken', accessToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "You've logged in successfully!"))
})

/**
 * Logout user
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const currentUser = req.currentUser?._id;

    await User.findByIdAndUpdate(currentUser,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    return res.status(200).
        clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, "You've logged out successfully!"))
})

/**
 * Refresh access token using refreshToken
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {

    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingToken) {
        throw new ApiError(400, "Invalid refresh token")
    }

    const REFRESH_TOKEN_SECRET = String(process.env.REFRESH_TOKEN_SECRET)
    try {
        const decodeToken = jwt.verify(incomingToken, REFRESH_TOKEN_SECRET) as IUser;

        const user = await User.findById(decodeToken._id);

        if (!user) {
            throw new ApiError(401, AUTH_FAILED)
        }

        if (incomingToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const { accessToken, refreshToken } = await generateTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: refreshToken },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        console.log(error);

        throw new ApiError(500, "Invalid refresh tokens")
    }
})