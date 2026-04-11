import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { Column } from "@generated/prisma";

type UpdateColumnInput = {
    id: string;
    name?: string;
    order?: number;
    requestingUserId: string;
};

export const updateColumn = async (input: UpdateColumnInput): Promise<Column> => {
    const existing = await prisma.column.findUnique({
        where: { id: input.id },
        include: { board: true },
    });
    if (!existing) {
        throw new AppError(404, "Column not found");
    }

    const member = await getProjectMember(existing.board.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Column not found or insufficient permissions");
    }

    // If only a rename — simple update, no reordering needed
    if (input.order === undefined || input.order === existing.order) {
        return prisma.column.update({
            where: { id: input.id },
            data: { ...(input.name !== undefined && { name: input.name }) },
        });
    }

    // Order is changing — shift all columns that sit between the old and new positions,
    // then place the moved column at its target position. Done in a transaction so the
    // board's order sequence stays consistent.
    const oldOrder = existing.order;
    const newOrder = input.order;

    return prisma.$transaction(async (tx) => {
        if (newOrder < oldOrder) {
            // Moving toward the front: slide every column in [newOrder, oldOrder) down by one
            await tx.column.updateMany({
                where: { boardId: existing.boardId, order: { gte: newOrder, lt: oldOrder }, id: { not: input.id } },
                data: { order: { increment: 1 } },
            });
        } else {
            // Moving toward the back: slide every column in (oldOrder, newOrder] up by one
            await tx.column.updateMany({
                where: { boardId: existing.boardId, order: { gt: oldOrder, lte: newOrder }, id: { not: input.id } },
                data: { order: { decrement: 1 } },
            });
        }

        return tx.column.update({
            where: { id: input.id },
            data: {
                ...(input.name !== undefined && { name: input.name }),
                order: newOrder,
            },
        });
    });
};
