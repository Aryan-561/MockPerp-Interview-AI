import type { Response } from "express";

class ApiResponse {

    static ok(res: Response, message: string, data?: any) {
        return res.status(200).json({
            status: "success",
            message,
            data
        })
    }

    static created(res: Response, message: string, data?: any) {
        return res.status(201).json({
            status: "success",
            message,
            data
        })
    }

}


export default ApiResponse;