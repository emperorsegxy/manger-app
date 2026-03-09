import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import type { Task } from "@generated/prisma";

type GetTaskListInput = {
    columnId: string;
    requestingUserId: string;
};

export const getTaskList = async (input: GetTaskListInput): Promise<Task[]> => {
    const column = await prisma.column.findUnique({
        where: { id: input.columnId },
        include: { board: true },
    });
    if (!column) throw new AppError(404, "Column not found");

    const member = await getProjectMember(column.board.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    return prisma.task.findMany({
        where: { columnId: input.columnId },
        orderBy: { order: "asc" },
    });
};
