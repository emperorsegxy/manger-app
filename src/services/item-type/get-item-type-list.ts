import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import type { ItemType } from "@generated/prisma";

type GetItemTypeListInput = {
    projectId: string;
    requestingUserId: string;
};

export const getItemTypeList = async (input: GetItemTypeListInput): Promise<ItemType[]> => {
    const member = await getProjectMember(input.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    return prisma.itemType.findMany({
        where: { OR: [{ projectId: null }, { projectId: input.projectId }] },
        orderBy: { name: "asc" },
    });
};
