import authentication from "@/middlewares/authentication";
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema";
import { getProjectListController, createProjectController, updateProjectController, deleteProjectController } from "@/controllers/project.controller";
import { ProjectCreateInputObjectZodSchema, ProjectUncheckedCreateInputObjectZodSchema } from "@generated/zod/schemas";
import express from "express"

const router = express.Router();

router.get('/list', authentication, getProjectListController)
router.post('/create', authentication, validateZodSchema(ProjectCreateInputObjectZodSchema.omit({ owner: true })), createProjectController)
router.patch('/update', authentication, validateZodSchema(ProjectCreateInputObjectZodSchema.omit({ owner: true })), updateProjectController)
router.delete('/delete', authentication, validateZodSchema(ProjectUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteProjectController)

export default router
