import { AUTH_FAILED } from "../constants";
import User from "../models/user.model";
import ApiError from "./ApiError";

export async function generateTokens(userId: string) {

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(401, AUTH_FAILED)
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "An occurred while generating access and refresh tokens")
    }
}