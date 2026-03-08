import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import type { Task } from "@generated/prisma";

type UpdateTaskInput = {
    id: string;
    title?: string;
    description?: string | null;
    order?: number;
    columnId?: string;
    requestingUserId: string;
};

export const updateTask = async (input: UpdateTaskInput): Promise<Task> => {
    const existing = await prisma.task.findUnique({
        where: { id: input.id },
        include: { column: { include: { board: { include: { project: true } } } } },
    });
    if (!existing || existing.column.board.project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Task not found or access denied");
    }

    if (input.columnId && input.columnId !== existing.columnId) {
        const newColumn = await prisma.column.findUnique({
            where: { id: input.columnId },
            include: { board: { include: { project: true } } },
        });
        if (!newColumn || newColumn.board.project.ownerId !== input.requestingUserId) {
            throw new AppError(403, "Target column not found or access denied");
        }
    }

    return prisma.task.update({
        where: { id: input.id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.order !== undefined && { order: input.order }),
            ...(input.columnId !== undefined && { columnId: input.columnId }),
        },
    });
};
