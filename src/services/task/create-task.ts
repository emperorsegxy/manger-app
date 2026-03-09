import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
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
        include: { board: true },
    });
    if (!column) throw new AppError(404, "Column not found");

    const member = await getProjectMember(column.board.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.MEMBER)) {
        throw new AppError(403, "Project not found or insufficient permissions");
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
            creatorId: input.requestingUserId,
        },
    });
};
