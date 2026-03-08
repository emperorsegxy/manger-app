import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";

type DeleteBoardInput = {
    id: string;
    requestingUserId: string;
};

export const deleteBoard = async (input: DeleteBoardInput): Promise<void> => {
    const existing = await prisma.board.findUnique({
        where: { id: input.id },
        include: { project: true },
    });
    if (!existing || existing.project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Board not found or access denied");
    }

    await prisma.$transaction([
        prisma.task.deleteMany({ where: { column: { boardId: input.id } } }),
        prisma.column.deleteMany({ where: { boardId: input.id } }),
        prisma.board.delete({ where: { id: input.id } }),
    ]);
};
