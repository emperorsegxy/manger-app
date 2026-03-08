import type { UserPureType } from "@generated/zod/schemas";

declare global {
    namespace Express {
        interface Request {
            user?: Omit<UserPureType, "password" | "projects">;
        }
    }
}
