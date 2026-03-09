import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import type { Board } from "@generated/prisma";

type GetBoardListInput = {
    projectId: string;
    requestingUserId: string;
};

export const getBoardList = async (input: GetBoardListInput): Promise<Board[]> => {
    const member = await getProjectMember(input.projectId, input.requestingUserId);
    if (!member) {
        throw new AppError(403, "Project not found or access denied");
    }

    return prisma.board.findMany({ where: { projectId: input.projectId } });
};
