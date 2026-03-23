import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { getProjectMember } from "@/lib/project-auth";
import { Prisma } from "@generated/prisma";

type GetCommentsInput = {
    taskId: string;
    requestingUserId: string;
};

const commentWithDetails = Prisma.validator<Prisma.TaskCommentDefaultArgs>()({
    include: {
        author: { select: { id: true, firstName: true, lastName: true, imgUrl: true } },
        mentions: {
            include: {
                user: { select: { id: true, firstName: true, lastName: true, imgUrl: true } },
            },
        },
    },
});

export type CommentWithDetails = Prisma.TaskCommentGetPayload<typeof commentWithDetails>;

export const getComments = async (input: GetCommentsInput): Promise<CommentWithDetails[]> => {
    const task = await prisma.task.findUnique({
        where: { id: input.taskId },
        include: { column: { include: { board: true } } },
    });
    if (!task) throw new AppError(404, "Task not found");

    const member = await getProjectMember(task.column.board.projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    return prisma.taskComment.findMany({
        where: { taskId: input.taskId },
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
