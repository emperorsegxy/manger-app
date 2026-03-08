import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import type { Task } from "@generated/prisma";

type GetTaskListInput = {
    columnId: string;
    requestingUserId: string;
};

export const getTaskList = async (input: GetTaskListInput): Promise<Task[]> => {
    const column = await prisma.column.findUnique({
        where: { id: input.columnId },
        include: { board: { include: { project: true } } },
    });
    if (!column || column.board.project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Column not found or access denied");
    }

    return prisma.task.findMany({
        where: { columnId: input.columnId },
        orderBy: { order: "asc" },
    });
};
