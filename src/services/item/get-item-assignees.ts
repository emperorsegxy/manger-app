import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import { Prisma } from "@generated/prisma";

type GetItemAssigneesInput = {
    itemId: string;
    requestingUserId: string;
};

const assigneeWithUser = Prisma.validator<Prisma.ItemAssigneeDefaultArgs>()({
    include: {
        user: { select: { id: true, firstName: true, lastName: true, imgUrl: true, email: true } },
    },
});

export type ItemAssigneeWithUser = Prisma.ItemAssigneeGetPayload<typeof assigneeWithUser>;

export const getItemAssignees = async (input: GetItemAssigneesInput): Promise<ItemAssigneeWithUser[]> => {
    const item = await prisma.item.findUnique({
        where: { id: input.itemId },
        include: { column: { include: { board: true } } },
    });
    if (!item) throw new AppError(404, "Item not found");

    const member = await getProjectMember(item.column.board.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    return prisma.itemAssignee.findMany({
        where: { itemId: input.itemId },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, imgUrl: true, email: true } },
        },
    });
};
