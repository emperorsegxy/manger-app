import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import type { ProjectMember } from "@generated/prisma";

type AcceptInvitationInput = {
    token: string;
    requestingUserId: string;
};

export const acceptInvitation = async (input: AcceptInvitationInput): Promise<ProjectMember> => {
    const hash = crypto.createHash("sha256").update(input.token).digest("hex");

    const invitation = await prisma.projectInvitation.findUnique({ where: { token: hash } });
    if (!invitation || invitation.expiresAt < new Date()) {
        throw new AppError(400, "Invalid or expired invitation token");
    }

    const user = await prisma.user.findUnique({ where: { id: input.requestingUserId } });
    if (!user) throw new AppError(404, "User not found");

    if (user.email !== invitation.email) {
        throw new AppError(403, "This invitation was sent to a different email address");
    }

    const existingMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: invitation.projectId, userId: user.id } },
    });
    if (existingMember) throw new AppError(409, "You are already a member of this project");

    const [membership] = await prisma.$transaction([
        prisma.projectMember.create({
            data: { projectId: invitation.projectId, userId: user.id, role: invitation.role },
        }),
        prisma.projectInvitation.delete({ where: { token: hash } }),
    ]);

    return membership;
};
