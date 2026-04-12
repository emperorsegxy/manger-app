import { prisma } from "@/lib/prisma";
import { ProjectRole } from "@generated/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";

type DeleteProjectInput = {
    id: string;
    requestingUserId: string;
};

export const deleteProject = async (input: DeleteProjectInput): Promise<void> => {
    const member = await getProjectMember(input.id, input.requestingUserId);
    if (!member || member.role !== ProjectRole.OWNER) {
        throw new AppError(403, "Only the project owner can delete the project");
    }

    await prisma.$transaction([
        prisma.item.deleteMany({ where: { column: { board: { projectId: input.id } } } }),
        prisma.column.deleteMany({ where: { board: { projectId: input.id } } }),
        prisma.board.deleteMany({ where: { projectId: input.id } }),
        prisma.projectMember.deleteMany({ where: { projectId: input.id } }),
        prisma.projectInvitation.deleteMany({ where: { projectId: input.id } }),
        prisma.project.delete({ where: { id: input.id } }),
    ]);
};
