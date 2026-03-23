import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";

type VerifyEmailInput = {
    token: string;
};

export const verifyEmail = async (input: VerifyEmailInput): Promise<void> => {
    const hash = crypto.createHash("sha256").update(input.token).digest("hex");

    const record = await prisma.emailVerificationToken.findUnique({ where: { token: hash } });
    if (!record || record.expiresAt < new Date()) {
        throw new AppError(400, "Invalid or expired verification token");
    }

    await prisma.user.update({
        where: { id: record.userId },
        data: { isEmailVerified: true },
    });

    await prisma.emailVerificationToken.delete({ where: { token: hash } });
};
