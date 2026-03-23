import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import { Prisma } from "@generated/prisma";

type GetTaskListInput = {
    columnId: string;
    requestingUserId: string;
};

const taskWithAssignees = Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: { assignees: { select: { userId: true } } },
});

export type TaskWithAssignees = Prisma.TaskGetPayload<typeof taskWithAssignees>;

export const getTaskList = async (input: GetTaskListInput): Promise<TaskWithAssignees[]> => {
    const column = await prisma.column.findUnique({
        where: { id: input.columnId },
        include: { board: true },
    });
    if (!column) throw new AppError(404, "Column not found");

    const member = await getProjectMember(column.board.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    return prisma.task.findMany({
        where: { columnId: input.columnId },
        orderBy: { order: "desc" },
        include: { assignees: { select: { userId: true } } },
    });
};
