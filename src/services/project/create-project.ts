import { prisma } from "@/lib/prisma";
import { ProjectRole } from "@generated/prisma";
import type { Project } from "@generated/prisma";

type CreateProjectInput = {
    name: string;
    ownerId: string;
};

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
    return prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: { name: input.name, ownerId: input.ownerId },
        });
        await tx.projectMember.create({
            data: { projectId: project.id, userId: input.ownerId, role: ProjectRole.OWNER },
        });
        return project;
    });
};
