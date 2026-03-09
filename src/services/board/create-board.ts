import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import type { Board } from "@generated/prisma";

type CreateBoardInput = {
    name: string;
    projectId: string;
    requestingUserId: string;
};

export const createBoard = async (input: CreateBoardInput): Promise<Board> => {
    const member = await getProjectMember(input.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    return prisma.board.create({
        data: { name: input.name, projectId: input.projectId },
    });
};
