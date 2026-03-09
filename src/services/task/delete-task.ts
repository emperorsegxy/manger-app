import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type DeleteTaskInput = {
    id: string;
    requestingUserId: string;
};

export const deleteTask = async (input: DeleteTaskInput): Promise<void> => {
    const existing = await prisma.task.findUnique({
        where: { id: input.id },
        include: { column: { include: { board: true } } },
    });
    if (!existing) throw new AppError(404, "Task not found");

    const member = await getProjectMember(existing.column.board.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    const isAdminOrOwner = hasMinRole(member, ProjectRole.ADMIN);
    const isCreator = existing.creatorId === input.requestingUserId;

    if (!isAdminOrOwner && !isCreator) {
        throw new AppError(403, "You can only delete tasks you created");
    }

    await prisma.task.delete({ where: { id: input.id } });
};
