import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { Column } from "@generated/prisma";

type UpdateColumnInput = {
    id: string;
    name: string;
    requestingUserId: string;
};

export const updateColumn = async (input: UpdateColumnInput): Promise<Column> => {
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

    return prisma.column.update({
        where: { id: input.id },
        data: { name: input.name },
    });
};
