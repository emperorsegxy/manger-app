import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash-password";
import { sendEmail } from "@/lib/send-email";
import { generateToken } from "@/lib/generate-token";
import { AppError } from "@/errors/AppError";
import type { UserPureType } from "@generated/zod/schemas";

type CreateUserInput = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    imgUrl?: string | null;
};

type SafeUser = Omit<UserPureType, "password" | "projects">;

export const createUser = async (input: CreateUserInput): Promise<SafeUser> => {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new AppError(400, "User already exists.");
    }

    const user = await prisma.user.create({
        data: {
            ...input,
            password: await hashPassword(input.password),
        },
    });

    const { plainToken, tokenHash, expiresAt } = generateToken(24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
        data: { token: tokenHash, expiresAt, userId: user.id },
    });

    const verifyUrl = `${process.env.APP_BASE_URL}/user/verify-email?token=${plainToken}`;
    await sendEmail(
        user.email,
        "Verify your email address",
        `<p>Welcome! Please verify your email address by clicking the link below. It expires in 24 hours.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
    );

    const { password, ...safeUser } = user;
    return safeUser;
};
