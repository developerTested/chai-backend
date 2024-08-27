import { Request, Response, response } from "express";
import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import User from "../models/user.model";
import { changeCurrentPasswordType, updateUserType } from "../schema/authSchema";
import { AUTH_FAILED, AUTH_REQUIRED, paginateOptions } from "../constants";
import { deleteFileFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";

/**
 * Update password
 */
export const changeCurrentPassword = asyncHandler(async (req: Request<{}, {}, changeCurrentPasswordType>, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const { password, oldPassword } = req.body;

    const user = await User.findById(req.currentUser?._id);

    if (!user) {
        throw new ApiError(401, AUTH_FAILED);
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = password
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))

})


/**
 * Update User account details
 */
export const updateAccountDetails = asyncHandler(async (req: Request<{}, {}, updateUserType>, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    const { email, fullName } = req.body;

    const updateUser = await User.findByIdAndUpdate(req.currentUser._id, {
        $set: {
            email,
            fullName,
        }
    }, {
        new: true
    }).select(["-password", "-refreshToken", "-__v", "-watchHistory"])

    return res.json(new ApiResponse(200, updateUser, "User details has been updated successfully!"))
})

/**
 * Upload avatar
 */
export const updateUserAvatar = asyncHandler(async (req: Request, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    if (!req.file?.path) {
        throw new ApiError(400, "avatar is required");
    }

    const user = await User.findById(req.currentUser?._id)

    if (!user) {
        throw new ApiError(401, AUTH_FAILED);
    }

    const avatarLocalPath = req.file.path;

    const removedAvatar = await deleteFileFromCloudinary(user.avatar)

    if (!removedAvatar) {
        throw new ApiError(500, "Unable to delete cover")
    }

    const newAvatar = await uploadToCloudinary(avatarLocalPath)

    if (!newAvatar) {
        throw new ApiError(500, "Unable to upload avatar")
    }

    const updateUser = await User.findByIdAndUpdate(user._id, {
        $set: {
            avatar: newAvatar.url,
        }
    }, {
        new: true
    }).select(["-password", "-refreshToken", "-__v", "-watchHistory"])

    return res.json(new ApiResponse(200, updateUser, "Avatar has been updated successfully"))
})


/**
 * Upload coverImage
 */
export const updateUserCoverImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.currentUser || !req.currentUser._id) {
        return res.status(401).json(new ApiError(401, AUTH_REQUIRED));
    }

    if (!req.file) {
        throw new ApiError(400, "coverImage is required");
    }

    const user = await User.findById(req.currentUser?._id)

    if (!user) {
        throw new ApiError(401, AUTH_FAILED);
    }

    const coverImageLocalPath = req.file.path;

    const removedCover = await deleteFileFromCloudinary(user.coverImage)

    if (!removedCover) {
        throw new ApiError(500, "Unable to delete cover")
    }

    const newCoverImage = await uploadToCloudinary(coverImageLocalPath)

    if (!newCoverImage) {
        throw new ApiError(500, "Unable to upload Cover Image")
    }

    const updateUser = await User.findByIdAndUpdate(user._id, {
        $set: {
            coverImage: newCoverImage.url,
        }
    }, {
        new: true
    }).select(["-password", "-refreshToken", "-__v", "-watchHistory"])

    return res.json(new ApiResponse(200, updateUser, "Cover Image has been updated successfully"))
})