import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type DeleteColumnInput = {
    id: string;
    requestingUserId: string;
};

export const deleteColumn = async (input: DeleteColumnInput): Promise<void> => {
    const existing = await prisma.column.findUnique({
        where: { id: input.id },
        include: { board: true },
    });
    if (!existing) {
        throw new AppError(404, "Column not found");
    }

    const member = await getProjectMember(existing.board.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Column not found or insufficient permissions");
    }

    await prisma.$transaction([
        prisma.item.deleteMany({ where: { columnId: input.id } }),
        prisma.column.delete({ where: { id: input.id } }),
    ]);
};
