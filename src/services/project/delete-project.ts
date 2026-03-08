import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";

type DeleteProjectInput = {
    id: string;
    requestingUserId: string;
};

export const deleteProject = async (input: DeleteProjectInput): Promise<void> => {
    const project = await prisma.project.findUnique({ where: { id: input.id } });
    if (!project || project.ownerId !== input.requestingUserId) {
        throw new AppError(403, "Project not found or access denied");
    }

    await prisma.$transaction([
        prisma.task.deleteMany({ where: { column: { board: { projectId: input.id } } } }),
        prisma.column.deleteMany({ where: { board: { projectId: input.id } } }),
        prisma.board.deleteMany({ where: { projectId: input.id } }),
        prisma.project.delete({ where: { id: input.id } }),
    ]);
};
