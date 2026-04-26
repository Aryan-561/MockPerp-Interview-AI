import express from "express"
import { handleRegister, handleLogin, handleLogout, handleRefreshToken, handleVerifyEmail, handleResendVerificationEmail } from "./controller.js"
import { restrictToAuthenticatedUser, authenticationMiddleware } from "../../common/middleware/auth.middleware.js"

const authRouter = express.Router()

authRouter.post("/register", handleRegister)
authRouter.post("/login", handleLogin)  
authRouter.post("/logout",authenticationMiddleware(),restrictToAuthenticatedUser(), handleLogout)
authRouter.post("/refresh-token", handleRefreshToken)
authRouter.get("/verify-email", handleVerifyEmail)
authRouter.post("/resend-verification-email", handleResendVerificationEmail)

export {authRouter}