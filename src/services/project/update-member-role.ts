import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import type { ProjectMember } from "@generated/prisma";
import { getProjectMember } from "@/lib/project-auth";

type UpdateMemberRoleInput = {
    projectId: string;
    userId: string;
    role: ProjectRole;
    requestingUserId: string;
};

export const updateMemberRole = async (input: UpdateMemberRoleInput): Promise<ProjectMember> => {
    const requestingMember = await getProjectMember(input.projectId, input.requestingUserId);
    if (!requestingMember || requestingMember.role !== ProjectRole.OWNER) {
        throw new AppError(403, "Only the project owner can change member roles");
    }

    const targetMember = await getProjectMember(input.projectId, input.userId);
    if (!targetMember) throw new AppError(404, "Member not found in this project");

    if (targetMember.role === ProjectRole.OWNER) {
        throw new AppError(403, "Cannot change the owner's role");
    }

    if (input.role === ProjectRole.OWNER) {
        throw new AppError(400, "Cannot assign the owner role");
    }

    return prisma.projectMember.update({
        where: { projectId_userId: { projectId: input.projectId, userId: input.userId } },
        data: { role: input.role },
    });
};
