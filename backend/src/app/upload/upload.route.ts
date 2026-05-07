import { Router } from "express";
import { upload } from "../../common/middleware/multer.middleware.js";
import { uploadResumecontroller } from "./upoad.controller.js";
import { authenticationMiddleware, restrictToAuthenticatedUser } from "../../common/middleware/auth.middleware.js";


const uploadRouter = Router();

uploadRouter.post("/resume", authenticationMiddleware() ,restrictToAuthenticatedUser(), upload.single("resume"), uploadResumecontroller)

export { uploadRouter }