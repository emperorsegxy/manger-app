import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
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
        include: { column: { include: { board: true } } },
    });
    if (!existing) throw new AppError(404, "Task not found");

    const projectId = existing.column.board.projectId;
    const member = await getProjectMember(projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.MEMBER)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    if (input.columnId && input.columnId !== existing.columnId) {
        const newColumn = await prisma.column.findUnique({
            where: { id: input.columnId },
            include: { board: true },
        });
        if (!newColumn || newColumn.board.projectId !== projectId) {
            throw new AppError(403, "Target column must belong to the same project");
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
