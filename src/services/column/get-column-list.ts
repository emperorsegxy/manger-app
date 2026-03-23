import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import type { Column } from "@generated/prisma";

type GetColumnListInput = {
    boardId: string;
    requestingUserId: string;
};

export const getColumnList = async (input: GetColumnListInput): Promise<Column[]> => {
    const board = await prisma.board.findUnique({ where: { id: input.boardId } });
    if (!board) {
        throw new AppError(404, "Board not found");
    }

    const member = await getProjectMember(board.projectId, input.requestingUserId);
    if (!member) {
        throw new AppError(403, "Board not found or access denied");
    }

    return prisma.column.findMany({
        where: { boardId: input.boardId },
        orderBy: { order: "asc" },
    });
};
