import type { Types } from "mongoose"
import  { ApiError } from "../../../common/utils/api-error.js"
import { User } from "../../../db/user.model.js"
import JWT from 'jsonwebtoken'

export interface TokenPayload {
    id: string
    email?: string
}


export const generateToken = async (userId: Types.ObjectId) => {
   const user = await User.findById(userId)
   
   if (!user) {
    throw ApiError.notFound("User not found")
   }

   const accessToken =  user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()

   user.refreshToken = refreshToken;
   await user.save({ validateBeforeSave: false });

   return { accessToken, refreshToken };

}

export function verifyUserToken(token: string, code : string): TokenPayload | null {
    try {
        
       const payload =  JWT.verify(token, code) as TokenPayload
       return payload;

    } catch (error) {
        console.error("Token verification failed: ", error);
        return null
    }
}