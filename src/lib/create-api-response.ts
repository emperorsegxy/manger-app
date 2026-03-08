import {Response} from "express";

export enum ErrorCode {
    SystemErr = "SYSTEM_ERR",
    NotFound = "NOT_FOUND",
    Unauthorized = "UNAUTHORIZED",
    Forbidden = "FORBIDDEN",
    ValidationErr = "VALIDATION_ERR",
    Conflict = "CONFLICT",
    BadRequest = "BAD_REQUEST",
    RateLimited = "RATE_LIMITED",
    ServiceUnavailable = "SERVICE_UNAVAILABLE",
}

interface SuccessResponse<T = any> {
    message: string;
    success: true;
    statusCode: number;
    data: T;
    timestamp: string
}

interface ErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    errorCode: ErrorCode;
    details?: unknown;
    timestamp: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ─── Options ─────────────────────────────────────────────────────────────────

interface SuccessOptions<T> {
    res: Response;
    message?: string;
    data?: T;
    statusCode?: number;
}

interface ErrorOptions {
    res: Response;
    message?: string;
    errorCode?: ErrorCode;
    details?: unknown;
    statusCode?: number;
}

export const createSuccessResponse = <T = any>({
                                            message = "Request Successful",
                                            statusCode = 200,
                                            data = {} as T,
                                            res
                                        }: SuccessOptions<T>): Response<ApiResponse<T>> => {
    const payload: SuccessResponse<T> = {
        message,
        statusCode,
        data,
        success: true,
        timestamp: timestamp()
    }
    return res.status(statusCode).send(payload)
}

const timestamp = () => new Date().toISOString();


export const createErrorResponse = ({
                   res,
                   message = "An unexpected error occurred",
                   errorCode = ErrorCode.SystemErr,
                   details,
                   statusCode = 500,
               }: ErrorOptions): Response<ApiResponse<never>> => {
    const payload: ErrorResponse = {
        success: false,
        statusCode,
        message,
        errorCode,
        ...(details !== undefined && {details}),
        timestamp: timestamp(),
    };

    return res.status(statusCode).json(payload);
}