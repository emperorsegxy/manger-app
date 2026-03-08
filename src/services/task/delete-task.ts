import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";

type DeleteTaskInput = {
    id: string;
    requestingUserId: string;
};

export const deleteTask = async (input: DeleteTaskInput): Promise<void> => {
    const existing = await prisma.task.findUnique({
        where: { id: input.id },
        include: { column: { include: { board: { include: { project: true } } } } },
    });
    if (!existing || existing.column.board.project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Task not found or access denied");
    }

    await prisma.task.delete({ where: { id: input.id } });
};
