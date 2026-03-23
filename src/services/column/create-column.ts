import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { Column } from "@generated/prisma";

type CreateColumnInput = {
    name: string;
    boardId: string;
    requestingUserId: string;
};

type CreateManyColumnsInput = {
    columns: { name: string; order: number }[];
    boardId: string;
    requestingUserId: string;
};

const resolveBoard = async (boardId: string, requestingUserId: string) => {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new AppError(404, "Board not found");

    const member = await getProjectMember(board.projectId, requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Board not found or insufficient permissions");
    }

    return board;
};

export const createColumn = async (input: CreateColumnInput): Promise<Column> => {
    await resolveBoard(input.boardId, input.requestingUserId);

    const lastColumn = await prisma.column.findFirst({
        where: { boardId: input.boardId },
        orderBy: { order: "desc" },
    });
    const order = lastColumn ? lastColumn.order + 1 : 1;

    return prisma.column.create({
        data: { name: input.name, boardId: input.boardId, order },
    });
};

export const createManyColumns = async (input: CreateManyColumnsInput): Promise<Column[]> => {
    await resolveBoard(input.boardId, input.requestingUserId);

    // const lastColumn = await prisma.column.findFirst({
    //     where: { boardId: input.boardId },
    //     orderBy: { order: "desc" },
    // });
    // // const baseOrder = lastColumn ? lastColumn.order : 0;

    const data = input.columns.map((col) => ({
        name: col.name,
        boardId: input.boardId,
        order: col.order,
    }));

    await prisma.column.createMany({ data });

    return prisma.column.findMany({
        where: { boardId: input.boardId},
        orderBy: { order: "asc" },
    });
};
