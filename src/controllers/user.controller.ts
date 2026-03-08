import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getAllUsers } from "@services/user/get-all-users";
import { createUser } from "@services/user/create-user";
import { authenticateUser } from "@services/user/authenticate-user";
import { requestPasswordReset } from "@services/user/request-password-reset";
import { resetPassword } from "@services/user/reset-password";
import { verifyEmail } from "@services/user/verify-email";
import { deleteUser } from "@services/user/delete-user";
import { createSuccessResponse, createErrorResponse, statusToErrorCode } from "@/lib/create-api-response";

export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        return createSuccessResponse({ res, message: "Successfully retrieved users", data: { users } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createUserController = async (req: Request, res: Response) => {
    try {
        const user = await createUser(req.body);
        return createSuccessResponse({ res, statusCode: 201, message: "Successfully created user", data: { user } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const authenticateUserController = async (req: Request, res: Response) => {
    try {
        const data = await authenticateUser(req.body);
        return createSuccessResponse({ res, message: "Successfully authenticated", data });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const requestPasswordResetController = async (req: Request, res: Response) => {
    try {
        await requestPasswordReset({ email: req.body.email });
        return createSuccessResponse({ res, message: "If that email exists, a reset link has been sent." });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        await resetPassword({ token: req.body.token, password: req.body.password });
        return createSuccessResponse({ res, message: "Password has been reset successfully." });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const verifyEmailController = async (req: Request, res: Response) => {
    try {
        await verifyEmail({ token: req.query.token as string });
        return createSuccessResponse({ res, message: "Email verified successfully." });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const deleteUserController = async (req: Request, res: Response) => {
    try {
        await deleteUser(req.user!.id);
        return createSuccessResponse({ res, message: "Account deleted successfully." });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};
