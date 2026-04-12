import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";

export const deleteUser = async (userId: string): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");

    await prisma.$transaction([
        prisma.itemAssignee.deleteMany({ where: { userId } }),
        prisma.item.deleteMany({ where: { column: { board: { project: { ownerId: userId } } } } }),
        prisma.column.deleteMany({ where: { board: { project: { ownerId: userId } } } }),
        prisma.board.deleteMany({ where: { project: { ownerId: userId } } }),
        prisma.projectMember.deleteMany({ where: { userId } }),
        prisma.projectInvitation.deleteMany({ where: { invitedById: userId } }),
        prisma.project.deleteMany({ where: { ownerId: userId } }),
        prisma.emailVerificationToken.deleteMany({ where: { userId } }),
        prisma.passwordResetToken.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } }),
    ]);
};
