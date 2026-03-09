import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { TaskAssignee } from "@generated/prisma";

type AssignTaskInput = {
    taskId: string;
    userId: string;
    requestingUserId: string;
};

export const assignTask = async (input: AssignTaskInput): Promise<TaskAssignee> => {
    const task = await prisma.task.findUnique({
        where: { id: input.taskId },
        include: { column: { include: { board: true } } },
    });
    if (!task) throw new AppError(404, "Task not found");

    const projectId = task.column.board.projectId;

    const requestingMember = await getProjectMember(projectId, input.requestingUserId);
    if (!requestingMember || !hasMinRole(requestingMember, ProjectRole.MEMBER)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    const targetMember = await getProjectMember(projectId, input.userId);
    if (!targetMember) {
        throw new AppError(400, "Assignee must be a member of this project");
    }

    const existing = await prisma.taskAssignee.findUnique({
        where: { taskId_userId: { taskId: input.taskId, userId: input.userId } },
    });
    if (existing) throw new AppError(409, "User is already assigned to this task");

    return prisma.taskAssignee.create({
        data: { taskId: input.taskId, userId: input.userId },
    });
};
