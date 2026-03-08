import { comparePassword } from "@/lib/compare-password";
import { prisma } from "@/lib/prisma";
import { signUserToken } from "@/lib/sign-user-token";
import { sendEmail } from "@/lib/send-email";
import { generateToken } from "@/lib/generate-token";
import { AppError } from "@/errors/AppError";
import {logger} from "@/loggers";

type AuthenticateUserInput = {
    email: string;
    password: string;
};

export const authenticateUser = async (input: AuthenticateUserInput): Promise<{ accessToken: string }> => {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
        throw new AppError(400, "User does not exist");
    }

    const match = await comparePassword({ hashedPassword: user.password, givenPassword: input.password });
    if (!match) {
        throw new AppError(400, "Creds combination does not match");
    }

    if (!user.isEmailVerified) {
        const existing = await prisma.emailVerificationToken.findUnique({ where: { userId: user.id } });
        const isExpiredOrMissing = !existing || existing.expiresAt < new Date();

        if (isExpiredOrMissing) {
            const { plainToken, tokenHash, expiresAt } = generateToken(24 * 60 * 60 * 1000);

            await prisma.emailVerificationToken.upsert({
                where: { userId: user.id },
                create: { token: tokenHash, expiresAt, userId: user.id },
                update: { token: tokenHash, expiresAt },
            });

            const verifyUrl = `${process.env.APP_BASE_URL}/verify-email?token=${plainToken}`;
            await sendEmail(
                user.email,
                "Verify your email address",
                `<p>You must verify your email before logging in. Click the link below — it expires in 24 hours.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
            );
        }

        throw new AppError(400, "Email not verified. Please check your inbox for the verification link.");
    }

    const { password, ...u } = user;
    const accessToken = signUserToken(u as any);
    logger.info("Successfully logged user in." + JSON.stringify(u))
    return { accessToken };
};
