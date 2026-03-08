import { prisma } from "@/lib/prisma";
import type { Project } from "@generated/prisma";

type UpdateProjectInput = {
    id: string;
    name: string;
    ownerId: string;
};

export const updateProject = async (input: UpdateProjectInput): Promise<Project> => {
    return prisma.project.update({
        where: { id: input.id },
        data: {
            name: input.name,
            ownerId: input.ownerId,
        },
    });
};
