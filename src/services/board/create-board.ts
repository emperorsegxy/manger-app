import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { Board } from "@generated/prisma";
import { createManyColumns } from "@services/column/create-column";

type ExpectedColumnPayload = {
    name: string,
    order: number
}

type CreateBoardInput = {
    name: string;
    projectId: string;
    requestingUserId: string;
    columns: ExpectedColumnPayload[]
};

export const createBoard = async (input: CreateBoardInput): Promise<Board> => {
    const member = await getProjectMember(input.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    let board = prisma.board.create({
        data: { name: input.name, projectId: input.projectId },
    });

    if (input.columns?.length) {
        await createManyColumns({ columns: input.columns, boardId: (await board).id, requestingUserId: input.requestingUserId })
    }

    const $board = prisma.board.findUnique({ where: { id: (await board).id }, include: { columns: true } })

    return $board as any
};
