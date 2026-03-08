import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import type { Board } from "@generated/prisma";

type UpdateBoardInput = {
    id: string;
    name: string;
    requestingUserId: string;
};

export const updateBoard = async (input: UpdateBoardInput): Promise<Board> => {
    const existing = await prisma.board.findUnique({
        where: { id: input.id },
        include: { project: true },
    });
    if (!existing || existing.project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Board not found or access denied");
    }

    return prisma.board.update({
        where: { id: input.id },
        data: { name: input.name },
    });
};
