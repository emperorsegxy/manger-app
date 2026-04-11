import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type DeleteItemTypeInput = {
    id: string;
    requestingUserId: string;
};

export const deleteItemType = async (input: DeleteItemTypeInput): Promise<void> => {
    const itemType = await prisma.itemType.findUnique({ where: { id: input.id } });
    if (!itemType) throw new AppError(404, "Item type not found");

    if (!itemType.projectId) {
        throw new AppError(403, "System item types cannot be deleted");
    }

    const member = await getProjectMember(itemType.projectId, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.ADMIN)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    await prisma.itemType.delete({ where: { id: input.id } });
};
