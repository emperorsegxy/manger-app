import { prisma } from "@/lib/prisma";
import type { Project } from "@generated/prisma";

export const getProjectList = async (userId: string): Promise<Project[]> => {
    return prisma.project.findMany({
        where: { members: { some: { userId } } },
        orderBy: { updatedAt: "desc" }
    });
};
