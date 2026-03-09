import { prisma } from "@/lib/prisma";
import { ProjectRole } from "@generated/prisma";
import type { Project } from "@generated/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";

type UpdateProjectInput = {
    id: string;
    name: string;
    ownerId: string;
};

export const updateProject = async (input: UpdateProjectInput): Promise<Project> => {
    const member = await getProjectMember(input.id, input.ownerId);
    if (!member || member.role !== ProjectRole.OWNER) {
        throw new AppError(403, "Only the project owner can update the project");
    }

    return prisma.project.update({
        where: { id: input.id },
        data: { name: input.name },
    });
};
