import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/send-email";
import { generateToken } from "@/lib/generate-token";

type RequestPasswordResetInput = {
    email: string;
};

export const requestPasswordReset = async (input: RequestPasswordResetInput): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) return;

    const { plainToken, tokenHash, expiresAt } = generateToken(60 * 60 * 1000);

    await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        create: { token: tokenHash, expiresAt, userId: user.id },
        update: { token: tokenHash, expiresAt },
    });

    const resetUrl = `${process.env.APP_BASE_URL}/user/reset-password?token=${plainToken}`;
    await sendEmail(
        user.email,
        "Reset your password",
        `<p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    );
};
