import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import { Prisma } from "@generated/prisma";

type GetItemListInput = {
    boardId: string;
    requestingUserId: string;
    columnIds?: string[];
    assigneeIds?: string[];
    typeIds?: string[];
};

const itemWithAssignees = Prisma.validator<Prisma.ItemDefaultArgs>()({
    include: { assignees: { select: { userId: true } }, type: { select: { id: true, name: true } } },
});

export type ItemWithAssignees = Prisma.ItemGetPayload<typeof itemWithAssignees>;

export const getItemList = async (input: GetItemListInput): Promise<ItemWithAssignees[]> => {
    const board = await prisma.board.findUnique({ where: { id: input.boardId } });
    if (!board) throw new AppError(404, "Board not found");

    const member = await getProjectMember(board.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    const where: Prisma.ItemWhereInput = {
        column: { boardId: input.boardId },
    };

    if (input.columnIds?.length) {
        where.columnId = { in: input.columnIds };
    }

    if (input.assigneeIds?.length) {
        where.assignees = { some: { userId: { in: input.assigneeIds } } };
    }

    if (input.typeIds?.length) {
        where.typeId = { in: input.typeIds };
    }

    return prisma.item.findMany({
        where,
        orderBy: { order: "asc" },
        include: { assignees: { select: { userId: true } }, type: { select: { id: true, name: true } } },
    });
};
