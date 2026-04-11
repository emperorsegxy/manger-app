import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { ItemAssignee } from "@generated/prisma";

type AssignItemInput = {
    itemId: string;
    userId: string;
    requestingUserId: string;
};

export const assignItem = async (input: AssignItemInput): Promise<ItemAssignee> => {
    const item = await prisma.item.findUnique({
        where: { id: input.itemId },
        include: { column: { include: { board: true } } },
    });
    if (!item) throw new AppError(404, "Item not found");

    const projectId = item.column.board.projectId;

    const requestingMember = await getProjectMember(projectId, input.requestingUserId);
    if (!requestingMember || !hasMinRole(requestingMember, ProjectRole.MEMBER)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    const targetMember = await getProjectMember(projectId, input.userId);
    if (!targetMember) {
        throw new AppError(400, "Assignee must be a member of this project");
    }

    const existing = await prisma.itemAssignee.findUnique({
        where: { itemId_userId: { itemId: input.itemId, userId: input.userId } },
    });
    if (existing) throw new AppError(409, "User is already assigned to this item");

    return prisma.itemAssignee.create({
        data: { itemId: input.itemId, userId: input.userId },
    });
};
