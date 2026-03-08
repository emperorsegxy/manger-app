import { prisma } from "@/lib/prisma";
import type { Project } from "@generated/prisma";

type CreateProjectInput = {
    name: string;
    ownerId: string;
};

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
    return prisma.project.create({
        data: {
            name: input.name,
            ownerId: input.ownerId,
        },
    });
};
