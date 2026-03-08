import express from "express";
import { z } from "zod";
import { UserCreateInputObjectZodSchema } from "@generated/zod/schemas";
import { validateZodSchema } from "@middlewares/validations/validateZodSchema";
import { getAllUsersController, createUserController, authenticateUserController, requestPasswordResetController, resetPasswordController, verifyEmailController } from "@/controllers/user.controller";

const router = express.Router();

router.get("/list", getAllUsersController);

router.post(
    "/register",
    validateZodSchema(UserCreateInputObjectZodSchema),
    createUserController
);

router.post("/authenticate", validateZodSchema(UserCreateInputObjectZodSchema.pick({ email: true, password: true })), authenticateUserController);

router.get("/verify-email", verifyEmailController);

router.post(
    "/forgot-password",
    validateZodSchema(UserCreateInputObjectZodSchema.pick({ email: true })),
    requestPasswordResetController
);

router.post(
    "/reset-password",
    validateZodSchema(z.object({ token: z.string(), password: z.string().min(8) })),
    resetPasswordController
);

export default router;
