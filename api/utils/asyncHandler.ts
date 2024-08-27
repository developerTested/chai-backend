import { RequestHandler, Response, Request, NextFunction } from "express";

export default function asyncHandler(requestHandler: RequestHandler) {
    return async function(req: Request, res: Response, next: NextFunction) {
        try {
            return await Promise.resolve(requestHandler(req, res, next));
        } catch (error) {
            return next(error);
        }
    }
}