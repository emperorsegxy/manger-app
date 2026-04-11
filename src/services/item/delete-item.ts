import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type DeleteItemInput = {
    id: string;
    requestingUserId: string;
};

export const deleteItem = async (input: DeleteItemInput): Promise<void> => {
    const existing = await prisma.item.findUnique({
        where: { id: input.id },
        include: { column: { include: { board: true } } },
    });
    if (!existing) throw new AppError(404, "Item not found");

    const member = await getProjectMember(existing.column.board.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    const isAdminOrOwner = hasMinRole(member, ProjectRole.ADMIN);
    const isCreator = existing.creatorId === input.requestingUserId;

    if (!isAdminOrOwner && !isCreator) {
        throw new AppError(403, "You can only delete items you created");
    }

    await prisma.item.delete({ where: { id: input.id } });
};
