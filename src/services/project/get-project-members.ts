import { prisma } from "@/lib/prisma";
import {AppError} from "@/errors/AppError";
import {logger} from "@/loggers";

export const getProjectMembers = async (projectId: string) => {
    const project = await prisma.project.findUnique({ where: { id: projectId }, include: {members: true} });
    if (!project) {
        throw new AppError(400, "Project not found");
    }
    logger.info(project.members + ">>>PROJECT MEMBERS DISPLAY<<<")
    const members = []
    for (const member of project.members) {
        const user = await prisma.user.findUnique({ where: { id: member.userId } })
        if (!user?.isEmailVerified) return
        members.push({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        })
    }
    return members;
}