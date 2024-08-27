import { Request, Response, NextFunction } from "express"
import { ZodSchema, ZodError } from 'zod'
import ApiError from "../utils/ApiError";

export default function validateRequest(schema: ZodSchema) {

    return function (req: Request, res: Response, next: NextFunction) {
        
        try {
            schema.parse({
                ...req.body,
                ...req.files,
            });

            next()
        } catch (error) {

            if (error instanceof ZodError) {
                const resError = error.errors.map((e) => e.message);
                return res.status(409).json(new ApiError(409, "Invalid data", resError))
            }

            next(error);

        }

    }

}
