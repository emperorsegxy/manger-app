import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type RemoveMemberInput = {
    projectId: string;
    userId: string;
    requestingUserId: string;
};

export const removeMember = async (input: RemoveMemberInput): Promise<void> => {
    const requestingMember = await getProjectMember(input.projectId, input.requestingUserId);
    if (!requestingMember || !hasMinRole(requestingMember, ProjectRole.ADMIN)) {
        throw new AppError(403, "Only admins and owners can remove members");
    }

    const targetMember = await getProjectMember(input.projectId, input.userId);
    if (!targetMember) throw new AppError(404, "Member not found in this project");

    if (targetMember.role === ProjectRole.OWNER) {
        throw new AppError(403, "Cannot remove the project owner");
    }

    if (requestingMember.role === ProjectRole.ADMIN && targetMember.role === ProjectRole.ADMIN) {
        throw new AppError(403, "Admins cannot remove other admins");
    }

    await prisma.projectMember.delete({ where: { projectId_userId: { projectId: input.projectId, userId: input.userId } } });
};
