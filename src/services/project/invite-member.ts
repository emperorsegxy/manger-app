import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import { generateToken } from "@/lib/generate-token";
import { sendEmail } from "@/lib/send-email";

type InviteMemberInput = {
    projectId: string;
    email: string;
    role?: ProjectRole;
    requestingUserId: string;
};

export const inviteMember = async (input: InviteMemberInput): Promise<void> => {
    const member = await getProjectMember(input.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Only admins and owners can invite members");
    }

    const project = await prisma.project.findUnique({ where: { id: input.projectId } });
    if (!project) throw new AppError(404, "Project not found");

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
        const alreadyMember = await getProjectMember(input.projectId, existingUser.id);
        if (alreadyMember) throw new AppError(409, "User is already a member of this project");
    }

    const role = input.role ?? ProjectRole.MEMBER;
    if (role === ProjectRole.OWNER) {
        throw new AppError(400, "Cannot invite a user as owner");
    }

    const { plainToken, tokenHash, expiresAt } = generateToken(7 * 24 * 60 * 60 * 1000);

    await prisma.projectInvitation.upsert({
        where: { projectId_email: { projectId: input.projectId, email: input.email } },
        create: {
            token: tokenHash,
            email: input.email,
            role,
            projectId: input.projectId,
            invitedById: input.requestingUserId,
            expiresAt,
        },
        update: {
            token: tokenHash,
            role,
            invitedById: input.requestingUserId,
            expiresAt,
        },
    });

    const inviteUrl = `${process.env.APP_BASE_URL}/accept-invite?token=${plainToken}`;
    await sendEmail(
        input.email,
        `You've been invited to join ${project.name}`,
        `<p>You've been invited to join the project "<strong>${project.name}</strong>" as a ${role.toLowerCase()}.</p><p>Click the link below to accept — it expires in 7 days.</p><p><a href="${inviteUrl}">${inviteUrl}</a></p>`
    );
};
