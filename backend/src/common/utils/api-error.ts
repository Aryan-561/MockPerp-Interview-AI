import type { Response } from "express";


class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    success: boolean;
    data?: any;
    constructor(statusCode: number, message: string, data: any = null) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.success = false;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }


    static badRequest(message: string = "Bad Request") {
        return new ApiError(400, message);
    }
    
    static unauthorized(message: string = "Unauthorized") {
        return new ApiError(401, message);
    }

    static forbidden(message: string = "Forbidden") {
        return new ApiError(403, message);
    }

    static notFound(message: string = "Not Found") {
        return new ApiError(404, message);
    }

    static internalServerError(message: string = "Internal Server Error") {
        return new ApiError(500, message);
    }

    static conflict(message: string = "Conflict") {
        return new ApiError(409, message);
    }

}

export {ApiError}