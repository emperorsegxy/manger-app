import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { Item } from "@generated/prisma";

type UpdateItemInput = {
    id: string;
    title?: string;
    description?: string | null;
    order?: number;
    columnId?: string;
    typeId?: string | null;
    requestingUserId: string;
};

export const updateItem = async (input: UpdateItemInput): Promise<Item> => {
    const existing = await prisma.item.findUnique({
        where: { id: input.id },
        include: { column: { include: { board: true } } },
    });
    if (!existing) throw new AppError(404, "Item not found");

    const projectId = existing.column.board.projectId;
    const member = await getProjectMember(projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.MEMBER)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    if (input.typeId) {
        const itemType = await prisma.itemType.findUnique({ where: { id: input.typeId } });
        if (!itemType) throw new AppError(404, "Item type not found");
        if (itemType.projectId && itemType.projectId !== projectId) {
            throw new AppError(403, "Item type does not belong to this project");
        }
    }

    if (input.columnId && input.columnId !== existing.columnId) {
        const newColumn = await prisma.column.findUnique({
            where: { id: input.columnId },
            include: { board: true },
        });

        const items = await prisma.item.aggregate({
            where: { columnId: input.columnId },
            _max: { order: true },
        });

        input.order = (items._max?.order ?? 0) + 1;

        if (!newColumn || newColumn.board.projectId !== projectId) {
            throw new AppError(403, "Target column must belong to the same project");
        }
    }

    return prisma.item.update({
        where: { id: input.id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.order !== undefined && { order: input.order }),
            ...(input.columnId !== undefined && { columnId: input.columnId }),
            ...(input.typeId !== undefined && { typeId: input.typeId }),
        },
    });
};
