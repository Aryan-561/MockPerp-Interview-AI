import type { Request, Response } from "express"
import { registerSchema } from "./schema/register.schema.js"
import { User } from "../../db/user.model.js"
import { ApiError } from "../../common/utils/api-error.js"
import { ApiResponse } from "../../common/utils/api-response.js"
import { loginSchema } from "./schema/login.schema.js"
import { generateToken, verifyUserToken } from "./utils/token.js"
import { env } from "../../env.js"

const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        }

async function handleRegister (req: Request, res: Response) {
    const validatedData = await registerSchema.safeParseAsync(req.body)
    if (validatedData.error) {
        throw ApiError.badRequest(validatedData.error.message)
    }
    const { name, email, password } = validatedData.data

    const userExists = await User.findOne({ email })
    if (userExists) {
        throw ApiError.conflict("User with this email already exists")
    }

    const user = await User.create({
        name,
        email,
        password
    })

    if (!user) {
        ApiError.internalServerError("Failed to create user")
    }

    return ApiResponse.created(res, "User registered successfully", user)

}

async function handleLogin  (req: Request, res: Response)  {
    const validatedData = await loginSchema.safeParseAsync(req.body)

    if (validatedData.error) {
        throw ApiError.badRequest(validatedData.error.message)
    }

    const { email, password } = validatedData.data

    const userExists = await User.findOne({ email })

    if (!userExists) {
        throw ApiError.notFound("User not found")
    }

    const isPasswordCorrect = await userExists.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
         throw ApiError.badRequest("Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateToken(userExists._id)  

    res.cookie("refreshToken", refreshToken, options )
    res.cookie("accessToken", accessToken, options)
    
    return ApiResponse.ok(res, "Login successful", {accessToken})


}


 async function handleLogout(req: Request, res: Response) {
        const {id} = req.user
        await User.findByIdAndUpdate(id, { refreshToken: null })

        res.clearCookie("refreshToken", options)
        res.clearCookie("accessToken", options)

        return ApiResponse.ok(res, "Logout successful")
    }


async function handleRefreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken
    
    if (!refreshToken) {
        throw ApiError.unauthorized("No refresh token provided")
    }

    const payload = verifyUserToken(refreshToken, env.REFRESH_TOKEN_CODE!)

    if (!payload) {
        throw ApiError.unauthorized("Invalid or expired refresh token")
    }

    const user = await User.findById(payload.id)

    if (!user || user.refreshToken !== refreshToken) {
        throw ApiError.unauthorized("Invalid refresh token")
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateToken(user._id)
    
    res.cookie("refreshToken", newRefreshToken, options)
    res.cookie("accessToken", accessToken, options)

    return ApiResponse.ok(res, "Token refreshed successfully", { accessToken })


}


export {
    handleRegister,
    handleLogin,
    handleLogout,
    handleRefreshToken
}