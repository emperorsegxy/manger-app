import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type UnassignItemInput = {
    itemId: string;
    userId: string;
    requestingUserId: string;
};

export const unassignItem = async (input: UnassignItemInput): Promise<void> => {
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

    const existing = await prisma.itemAssignee.findUnique({
        where: { itemId_userId: { itemId: input.itemId, userId: input.userId } },
    });
    if (!existing) throw new AppError(404, "User is not assigned to this item");

    await prisma.itemAssignee.delete({
        where: { itemId_userId: { itemId: input.itemId, userId: input.userId } },
    });
};
