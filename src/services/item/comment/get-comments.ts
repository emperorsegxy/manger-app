import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import { Prisma } from "@generated/prisma";

type GetCommentsInput = {
    itemId: string;
    requestingUserId: string;
};

const commentWithDetails = Prisma.validator<Prisma.ItemCommentDefaultArgs>()({
    include: {
        author: { select: { id: true, firstName: true, lastName: true, imgUrl: true } },
        mentions: {
            include: {
                user: { select: { id: true, firstName: true, lastName: true, imgUrl: true } },
            },
        },
    },
});

export type CommentWithDetails = Prisma.ItemCommentGetPayload<typeof commentWithDetails>;

export const getComments = async (input: GetCommentsInput): Promise<CommentWithDetails[]> => {
    const item = await prisma.item.findUnique({
        where: { id: input.itemId },
        include: { column: { include: { board: true } } },
    });
    if (!item) throw new AppError(404, "Item not found");

    const member = await getProjectMember(item.column.board.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    return prisma.itemComment.findMany({
        where: { itemId: input.itemId },
        orderBy: { createdAt: "asc" },
        include: {
            author: { select: { id: true, firstName: true, lastName: true, imgUrl: true } },
            mentions: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, imgUrl: true } },
                },
            },
        },
    });
};
