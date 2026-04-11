import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";

type DeleteCommentInput = {
    id: string;
    requestingUserId: string;
};

export const deleteComment = async (input: DeleteCommentInput): Promise<void> => {
    const comment = await prisma.itemComment.findUnique({
        where: { id: input.id },
        include: { item: { include: { column: { include: { board: true } } } } },
    });
    if (!comment) throw new AppError(404, "Comment not found");

    const projectId = comment.item.column.board.projectId;

    const member = await getProjectMember(projectId, input.requestingUserId);
    if (!member) throw new AppError(403, "Project not found or access denied");

    const isAdminOrOwner = hasMinRole(member, ProjectRole.ADMIN);
    const isAuthor = comment.authorId === input.requestingUserId;

    if (!isAdminOrOwner && !isAuthor) {
        throw new AppError(403, "You can only delete your own comments");
    }

    await prisma.itemComment.delete({ where: { id: input.id } });
};
