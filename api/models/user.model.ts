import mongoose, { Model, Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { IUserMethods, IUser } from "../types/authTypes";

export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        username: {
            type: String,
            required: [true, "User Name is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            index: true
        },
        avatar: {
            type: String,
        },
        coverImage: {
            type: String,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
        verified: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password)
}

const ACCESS_TOKEN_SECRET = String(process.env.ACCESS_TOKEN_SECRET)
const REFRESH_TOKEN_SECRET = String(process.env.REFRESH_TOKEN_SECRET)
const ACCESS_TOKEN_EXPIRY = String(process.env.ACCESS_TOKEN_EXPIRY)
const REFRESH_TOKEN_EXPIRY = String(process.env.REFRESH_TOKEN_EXPIRY)

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema)

export default User;