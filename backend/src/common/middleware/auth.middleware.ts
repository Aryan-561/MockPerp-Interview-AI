import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { verifyUserToken } from "../../app/auth/utils/token.js";
import {env} from "../../env.js"

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}


export  function authenticationMiddleware() {
    return async function (req: Request, res: Response, next: NextFunction) {
        let token: string | undefined;
        console.log("Cookies: ", req.cookies);
        // Try to get token from cookies first
        if (req.cookies.accessToken) {
            token = req.cookies.accessToken;
            console.log("Token found in cookies");
        } else if (req.headers["authorization"]) {
            // Or from Authorization header
            const authHeader = req.headers["authorization"];
            if (!authHeader.startsWith('Bearer')) {
                throw ApiError.badRequest('authorization header must start with Bearer')
            }
            token = authHeader.split(' ')[1]
        }

        if (!token) {
            return next()
        }

        const payload = verifyUserToken(token, env.ACCESS_TOKEN_CODE!);

        if (!payload) {
            return next(ApiError.unauthorized("Invalid or expired token"));
        }

    
        (req as Request).user = payload;


        return next()
    }

}


export function restrictToAuthenticatedUser() {

    return function (req: Request, res: Response, next: NextFunction) {
        if (!req.user) {
            throw ApiError.unauthorized("You must be logged in to access this resource")
        }
        return next()
    }

}