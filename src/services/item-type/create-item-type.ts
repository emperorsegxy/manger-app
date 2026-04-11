import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { ItemType } from "@generated/prisma";

type CreateItemTypeInput = {
    name: string;
    projectId: string;
    requestingUserId: string;
};

export const createItemType = async (input: CreateItemTypeInput): Promise<ItemType> => {
    const member = await getProjectMember(input.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    const existing = await prisma.itemType.findFirst({
        where: { name: { equals: input.name, mode: "insensitive" }, projectId: input.projectId },
    });
    if (existing) throw new AppError(409, "An item type with that name already exists in this project");

    return prisma.itemType.create({
        data: { name: input.name, projectId: input.projectId },
    });
};
