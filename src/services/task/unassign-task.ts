import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type UnassignTaskInput = {
    taskId: string;
    userId: string;
    requestingUserId: string;
};

export const unassignTask = async (input: UnassignTaskInput): Promise<void> => {
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

    const existing = await prisma.taskAssignee.findUnique({
        where: { taskId_userId: { taskId: input.taskId, userId: input.userId } },
    });
    if (!existing) throw new AppError(404, "User is not assigned to this task");

    await prisma.taskAssignee.delete({
        where: { taskId_userId: { taskId: input.taskId, userId: input.userId } },
    });
};
