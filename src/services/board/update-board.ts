import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { Board } from "@generated/prisma";

type UpdateBoardInput = {
    id: string;
    name: string;
    requestingUserId: string;
};

export const updateBoard = async (input: UpdateBoardInput): Promise<Board> => {
    const existing = await prisma.board.findUnique({ where: { id: input.id } });
    if (!existing) {
        throw new AppError(403, "Board not found or access denied");
    }

    const member = await getProjectMember(existing.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Board not found or insufficient permissions");
    }

    return prisma.board.update({
        where: { id: input.id },
        data: { name: input.name },
    });
};
