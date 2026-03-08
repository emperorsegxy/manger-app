import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getAllUsers } from "@services/user/get-all-users";
import { createUser } from "@services/user/create-user";
import { authenticateUser } from "@services/user/authenticate-user";
import { requestPasswordReset } from "@services/user/request-password-reset";
import { resetPassword } from "@services/user/reset-password";
import { verifyEmail } from "@services/user/verify-email";
import {createSuccessResponse} from "@/lib/create-api-response";

export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const createUserController = async (req: Request, res: Response) => {
    try {
        const user = await createUser(req.body);
        res.status(201).send({ user });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        console.log(err)
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const authenticateUserController = async (req: Request, res: Response) => {
    try {
        const data = await authenticateUser(req.body);
        return createSuccessResponse({ data, res })
        // res.status(200).send({ message: "Successfully authenticated", data });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        console.log(err)
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const requestPasswordResetController = async (req: Request, res: Response) => {
    try {
        await requestPasswordReset({ email: req.body.email });
        res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        await resetPassword({ token: req.body.token, password: req.body.password });
        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const verifyEmailController = async (req: Request, res: Response) => {
    try {
        await verifyEmail({ token: req.query.token as string });
        res.status(200).json({ message: "Email verified successfully." });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};
