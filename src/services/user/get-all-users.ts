import { prisma } from "@/lib/prisma";
import type { User } from "@generated/prisma";

export const getAllUsers = async (): Promise<User[]> => {
    return prisma.user.findMany({});
}
