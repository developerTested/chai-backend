import { Request } from 'express';

declare module 'express' {
    interface Request {
        currentUser?: IUser;
    }
}

export type UserRequest<P = any, B = any, Q = any> = Request<P, B, Q>

export type IUser = {
    _id: string,
    username: string,
    fullName: string,
    email: string,
    password: string,
    avatar: string,
    coverImage: string,
    watchHistory: [],
    refreshToken: string,
    verified: boolean,
    createdAt: string,
}


export type IUserMethods = {
    isPasswordCorrect(password: string): Promise<Boolean>,
    generateAccessToken(): string,
    generateRefreshToken(): string,
  }
