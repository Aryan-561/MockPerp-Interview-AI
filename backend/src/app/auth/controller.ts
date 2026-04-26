import type { Request, Response } from "express"
import { registerSchema } from "./schema/register.schema.js"
import { User } from "../../db/user.model.js"
import { ApiError } from "../../common/utils/api-error.js"
import { ApiResponse } from "../../common/utils/api-response.js"
import { loginSchema } from "./schema/login.schema.js"
import { generateToken, verifyUserToken } from "./utils/token.js"
import { emailService } from "../../common/utils/email.service.js"
import { env } from "../../env.js"
import crypto from "crypto"

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
        throw ApiError.internalServerError("Failed to create user")
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save token to user
    user.emailVerificationToken = emailVerificationToken
    user.emailVerificationTokenExpiry = emailVerificationTokenExpiry
    await user.save()

    // Send verification email
    try {
        await emailService.sendVerificationEmail(email, emailVerificationToken)
    } catch (error) {
        console.error("Failed to send verification email:", error)
        // Don't fail registration if email fails to send
    }

    return ApiResponse.created(res, "User registered successfully. Please check your email to verify.", {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerfied: user.isEmailVerfied
        }
    })

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

    // Check if email is verified
    if (!userExists.isEmailVerfied) {
        throw ApiError.badRequest("Please verify your email before logging in")
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



async function handleVerifyEmail(req: Request, res: Response) {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
        throw ApiError.badRequest("Invalid verification token")
    }

    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationTokenExpiry: { $gt: new Date() }
    })

    if (!user) {
        throw ApiError.badRequest("Invalid or expired verification token")
    }

    // Mark email as verified
    user.isEmailVerfied = true
    user.emailVerificationToken = null as any
    user.emailVerificationTokenExpiry = null as any
    await user.save()

    // Send welcome email
    try {
        await emailService.sendWelcomeEmail(user.email, user.name)
    } catch (error) {
        console.error("Failed to send welcome email:", error)
        // Don't fail if welcome email fails
    }

    return ApiResponse.ok(res, "Email verified successfully. You can now login.", {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerfied: user.isEmailVerfied
        }
    })
}

async function handleResendVerificationEmail(req: Request, res: Response) {
    const { email } = req.body

    if (!email) {
        throw ApiError.badRequest("Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw ApiError.notFound("User not found")
    }

    if (user.isEmailVerfied) {
        throw ApiError.badRequest("Email is already verified")
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.emailVerificationToken = emailVerificationToken
    user.emailVerificationTokenExpiry = emailVerificationTokenExpiry
    await user.save()

    try {
        await emailService.sendVerificationEmail(email, emailVerificationToken)
    } catch (error) {
        console.error("Failed to resend verification email:", error)
        throw ApiError.internalServerError("Failed to send email")
    }

    return ApiResponse.ok(res, "Verification email sent successfully")
}


export {
    handleRegister,
    handleLogin,
    handleLogout,
    handleRefreshToken,
    handleVerifyEmail,
    handleResendVerificationEmail
}
