import { z } from "zod";
import express from "express";
import authentication from "@/middlewares/authentication";
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema";
import {
    getProjectListController,
    createProjectController,
    updateProjectController,
    deleteProjectController,
    inviteMemberController,
    acceptInvitationController,
    removeMemberController,
    updateMemberRoleController,
} from "@/controllers/project.controller";
import { ProjectCreateInputObjectZodSchema, ProjectUncheckedCreateInputObjectZodSchema, ProjectMemberUncheckedCreateInputObjectZodSchema } from "@generated/zod/schemas";

const router = express.Router();

router.get("/list", authentication, getProjectListController);
router.post("/create", authentication, validateZodSchema(ProjectCreateInputObjectZodSchema.omit({ owner: true })), createProjectController);
router.patch("/update", authentication, validateZodSchema(ProjectCreateInputObjectZodSchema.omit({ owner: true })), updateProjectController);
router.delete("/delete", authentication, validateZodSchema(ProjectUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteProjectController);

router.post("/invite", authentication, validateZodSchema(ProjectMemberUncheckedCreateInputObjectZodSchema.pick({ projectId: true, role: true }).extend({ email: z.string().email() }).partial({ role: true })), inviteMemberController);
router.get("/accept-invite", authentication, acceptInvitationController);
router.delete("/remove-member", authentication, validateZodSchema(ProjectMemberUncheckedCreateInputObjectZodSchema.pick({ projectId: true, userId: true })), removeMemberController);
router.patch("/update-member-role", authentication, validateZodSchema(ProjectMemberUncheckedCreateInputObjectZodSchema.pick({ projectId: true, userId: true, role: true })), updateMemberRoleController);

export default router;
