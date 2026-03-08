import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import type { Board } from "@generated/prisma";

type CreateBoardInput = {
    name: string;
    projectId: string;
    requestingUserId: string;
};

export const createBoard = async (input: CreateBoardInput): Promise<Board> => {
    const project = await prisma.project.findUnique({ where: { id: input.projectId } });
    if (!project || project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Project not found or access denied");
    }

    return prisma.board.create({
        data: {
            name: input.name,
            projectId: input.projectId,
        },
    });
};
