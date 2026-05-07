import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import { reinitializeController } from "../chat/chat.controller.js";

async function uploadResumecontroller(req: Request, res: Response) {
    console.log("File upload hit");
    const file = req.file;
    console.log("File : ", file);
    if (!file) {
        throw ApiError.badRequest("File is required");
    }

    // Extract the role the user selected on the frontend.
    // Falls back to a sensible default if not provided.
    const role: string = (req.body?.role as string)?.trim() || "Software Developer";

    // Re-initialize the AI interviewer with the fresh resume + selected role.
    await reinitializeController(role);

    console.log(`✅ Resume uploaded. Interview session initialized for role: "${role}"`);

    return ApiResponse.created(res, "Resume uploaded and interview session initialized", {
        message: "Resume uploaded successfully",
        role,
    });
}

export { uploadResumecontroller };
