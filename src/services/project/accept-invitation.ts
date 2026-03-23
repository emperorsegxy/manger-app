import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import type { ProjectMember } from "@generated/prisma";
import { logger } from "@/loggers";

type AcceptInvitationInput = {
    token: string;
    // requestingUserId: string;
};

export const acceptInvitation = async (input: AcceptInvitationInput): Promise<ProjectMember> => {
    const hash = crypto.createHash("sha256").update(input.token).digest("hex");

    const invitation = await prisma.projectInvitation.findUnique({ where: { token: hash } });
    if (!invitation || invitation.expiresAt < new Date()) {
        throw new AppError(400, "Invalid or expired invitation token");
    }

    // check if user exists at all in the system with their email address, since that's also unique
    let user = await prisma.user.findUnique({ where: { email: invitation.email } })

    if (user) {
        logger.info('[PROJECT INVITATION]: user already exists in the system as ' + invitation.email)
        const existingMember = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId: invitation.projectId, userId: user.id } },
        });
        if (existingMember) throw new AppError(409, "You are already a member of this project");
    } else {
        throw new AppError(400, "User must be registered to the platform before accepting invitation")
    }
    const [membership] = await prisma.$transaction([
        prisma.projectMember.create({
            data: { projectId: invitation.projectId, userId: user.id, role: invitation.role },
        }),
        prisma.projectInvitation.delete({ where: { token: hash } }),
    ]);

    return membership;
};
