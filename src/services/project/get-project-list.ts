import { prisma } from "@/lib/prisma";
import type { Project } from "@generated/prisma";

export const getProjectList = async (ownerId: string): Promise<Project[]> => {
    return prisma.project.findMany({ where: { ownerId } });
};
