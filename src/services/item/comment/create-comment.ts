import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { ProjectRole } from "@generated/prisma";
import { getProjectMember, hasMinRole } from "@/lib/project-auth";
import { sendEmail } from "@/lib/send-email";
import { tiptapToHtml } from "@/lib/tiptap-to-html";
import juice from "juice";
import type { CommentWithDetails } from "./get-comments";

type CreateCommentInput = {
    itemId: string;
    content: string;
    mentionedUserIds?: string[];
    requestingUserId: string;
};

export const createComment = async (input: CreateCommentInput): Promise<CommentWithDetails> => {
    const item = await prisma.item.findUnique({
        where: { id: input.itemId },
        include: { column: { include: { board: { include: { project: true } } } } },
    });
    if (!item) throw new AppError(404, "Item not found");

    const { board } = item.column;
    const { project } = board;

    const member = await getProjectMember(project.id, input.requestingUserId);
    if (!member || !hasMinRole(member, ProjectRole.MEMBER)) {
        throw new AppError(403, "Project not found or insufficient permissions");
    }

    let mentionedUsers: { id: string; email: string; firstName: string }[] = [];

    if (input.mentionedUserIds && input.mentionedUserIds.length > 0) {
        const mentionedMembers = await prisma.projectMember.findMany({
            where: { projectId: project.id, userId: { in: input.mentionedUserIds } },
            select: { userId: true },
        });
        const validIds = new Set(mentionedMembers.map((m) => m.userId));
        const invalid = input.mentionedUserIds.find((id) => !validIds.has(id));
        if (invalid) {
            throw new AppError(400, `User ${invalid} is not a member of this project`);
        }

        mentionedUsers = await prisma.user.findMany({
            where: { id: { in: input.mentionedUserIds } },
            select: { id: true, email: true, firstName: true },
        });
    }

    const author = await prisma.user.findUnique({
        where: { id: input.requestingUserId },
        select: { firstName: true, lastName: true },
    });

    const comment = await prisma.itemComment.create({
        data: {
            content: input.content,
            itemId: input.itemId,
            authorId: input.requestingUserId,
            mentions: {
                create: (input.mentionedUserIds ?? []).map((userId) => ({ userId })),
            },
        },
        include: {
            author: { select: { id: true, firstName: true, lastName: true, imgUrl: true } },
            mentions: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, imgUrl: true } },
                },
            },
        },
    });

    if (mentionedUsers.length > 0) {
        const authorName = author ? `${author.firstName} ${author.lastName}` : "Someone";
        const inlinedContent = juice(tiptapToHtml(input.content));

        await Promise.all(
            mentionedUsers.map((u) =>
                sendEmail(
                    u.email,
                    `${authorName} mentioned you in a comment on "${item.title}"`,
                    juice(`
                        <div style="font-family: sans-serif; color: #111;">
                            <p>Hi ${u.firstName},</p>
                            <p><strong>${authorName}</strong> mentioned you in a comment on item <strong>"${item.title}"</strong> in project <strong>${project.name}</strong>.</p>
                            <div style="border-left: 3px solid #6366f1; padding: 8px 16px; margin: 16px 0; background: #f5f5f5;">
                                ${inlinedContent}
                            </div>
                        </div>
                    `)
                )
            )
        );
    }

    return comment;
};
