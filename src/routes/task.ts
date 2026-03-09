import express from "express";
import {
    TaskUncheckedCreateInputObjectZodSchema,
    TaskAssigneeCreateResultSchema
} from "@generated/zod/schemas";
import authentication from "@/middlewares/authentication";
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema";
import {
    getTaskListController,
    createTaskController,
    updateTaskController,
    deleteTaskController,
    assignTaskController,
    unassignTaskController,
} from "@/controllers/task.controller";

const router = express.Router();

router.get("/list", authentication, getTaskListController);
router.post("/create", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.omit({ id: true, order: true, creatorId: true })), createTaskController);
router.patch("/update", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.omit({ creatorId: true }).partial().required({ id: true })), updateTaskController);
router.delete("/delete", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteTaskController);

router.post("/assign", authentication, validateZodSchema(TaskAssigneeCreateResultSchema.pick({ taskId: true, userId: true })), assignTaskController);
router.delete("/unassign", authentication, validateZodSchema(TaskAssigneeCreateResultSchema.pick({ taskId: true, userId: true })), unassignTaskController);

export default router;
