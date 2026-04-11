import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { Item } from "@generated/prisma";

type CreateItemInput = {
    title: string;
    description?: string | null;
    columnId: string;
    typeId?: string | null;
    requestingUserId: string;
};

export const createItem = async (input: CreateItemInput): Promise<Item> => {
    const column = await prisma.column.findUnique({
        where: { id: input.columnId },
        include: { board: true },
    });
    if (!column) throw new AppError(404, "Column not found");

    const member = await getProjectMember(column.board.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.MEMBER)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    if (input.typeId) {
        const itemType = await prisma.itemType.findUnique({ where: { id: input.typeId } });
        if (!itemType) throw new AppError(404, "Item type not found");
        if (itemType.projectId && itemType.projectId !== column.board.projectId) {
            throw new AppError(403, "Item type does not belong to this project");
        }
    }

    const aggregate = await prisma.item.aggregate({
        where: { columnId: input.columnId },
        _max: { order: true },
    });
    const order = (aggregate._max.order ?? 0) + 1;

    return prisma.item.create({
        data: {
            title: input.title,
            description: input.description,
            order,
            columnId: input.columnId,
            creatorId: input.requestingUserId,
            ...(input.typeId && { typeId: input.typeId }),
        },
    });
};
