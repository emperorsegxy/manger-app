import { prisma } from "@/lib/prisma";
import { ProjectRole } from "@generated/prisma";
import type { ProjectMember } from "@generated/prisma";

const roleLevel: Record<ProjectRole, number> = {
    [ProjectRole.VIEWER]: 0,
    [ProjectRole.MEMBER]: 1,
    [ProjectRole.ADMIN]: 2,
    [ProjectRole.OWNER]: 3,
};

export const getProjectMember = async (projectId: string, userId: string): Promise<ProjectMember | null> => {
    return prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
    });
};

export const hasMinRole = (member: ProjectMember, minRole: ProjectRole): boolean => {
    return roleLevel[member.role] >= roleLevel[minRole];
};
