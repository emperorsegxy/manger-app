import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash-password";
import { AppError } from "@/errors/AppError";

type ResetPasswordInput = {
    token: string;
    password: string;
};

export const resetPassword = async (input: ResetPasswordInput): Promise<void> => {
    const hash = crypto.createHash("sha256").update(input.token).digest("hex");

    const record = await prisma.passwordResetToken.findUnique({ where: { token: hash } });
    if (!record || record.expiresAt < new Date()) {
        throw new AppError(400, "Invalid or expired reset token");
    }

    await prisma.user.update({
        where: { id: record.userId },
        data: { password: await hashPassword(input.password) },
    });

    await prisma.passwordResetToken.delete({ where: { token: hash } });
};
