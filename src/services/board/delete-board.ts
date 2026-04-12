import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type DeleteBoardInput = {
    id: string;
    requestingUserId: string;
};

export const deleteBoard = async (input: DeleteBoardInput): Promise<void> => {
    const existing = await prisma.board.findUnique({ where: { id: input.id } });
    if (!existing) {
        throw new AppError(403, "Board not found or access denied");
    }

    const member = await getProjectMember(existing.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Board not found or insufficient permissions");
    }

    await prisma.$transaction([
        prisma.item.deleteMany({ where: { column: { boardId: input.id } } }),
        prisma.column.deleteMany({ where: { boardId: input.id } }),
        prisma.board.delete({ where: { id: input.id } }),
    ]);
};
