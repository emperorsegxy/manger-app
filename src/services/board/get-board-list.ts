import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import type { Board } from "@generated/prisma";

type GetBoardListInput = {
    projectId: string;
    requestingUserId: string;
};

export const getBoardList = async (input: GetBoardListInput): Promise<Board[]> => {
    const project = await prisma.project.findUnique({ where: { id: input.projectId } });
    if (!project || project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Project not found or access denied");
    }

    return prisma.board.findMany({ where: { projectId: input.projectId } });
};
