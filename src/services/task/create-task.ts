import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import type { Task } from "@generated/prisma";

type CreateTaskInput = {
    title: string;
    description?: string | null;
    columnId: string;
    requestingUserId: string;
};

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
    const column = await prisma.column.findUnique({
        where: { id: input.columnId },
        include: { board: { include: { project: true } } },
    });
    if (!column || column.board.project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Column not found or access denied");
    }

    const aggregate = await prisma.task.aggregate({
        where: { columnId: input.columnId },
        _max: { order: true },
    });
    const order = (aggregate._max.order ?? 0) + 1;

    return prisma.task.create({
        data: {
            title: input.title,
            description: input.description,
            order,
            columnId: input.columnId,
        },
    });
};
