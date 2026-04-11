import { prisma } from "@/lib/prisma";

const SYSTEM_ITEM_TYPES = [
    { id: "task", name: "Task" },
    { id: "bug", name: "Bug" },
    { id: "story", name: "Story" },
    { id: "epic", name: "Epic" },
];

export const seedItemTypes = async () => {
    for (const type of SYSTEM_ITEM_TYPES) {
        await prisma.itemType.upsert({
            where: { id: type.id },
            update: {},
            create: { id: type.id, name: type.name, projectId: null },
        });
    }
};
