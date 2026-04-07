import type { Response } from "express";


class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }


    static badRequest(message: string = "Bad Request") {
        return new ApiError(400, message);
    }

}