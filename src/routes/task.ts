import express from "express";
import {
    TaskUncheckedCreateInputObjectZodSchema,
    TaskAssigneeCreateResultSchema,
    TaskCommentUncheckedCreateInputObjectZodSchema,
} from "@generated/zod/schemas";
import { z } from "zod";
import authentication from "@/middlewares/authentication";
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema";
import {
    getTaskListController,
    createTaskController,
    updateTaskController,
    deleteTaskController,
    assignTaskController,
    unassignTaskController,
    getCommentsController,
    createCommentController,
    deleteCommentController,
} from "@/controllers/task.controller";

const router = express.Router();

router.get("/list", authentication, getTaskListController);
router.post("/create", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.omit({ id: true, order: true, creatorId: true })), createTaskController);
router.patch("/update", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.omit({ creatorId: true }).partial().required({ id: true })), updateTaskController);
router.delete("/delete", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteTaskController);

router.post("/assign", authentication, validateZodSchema(TaskAssigneeCreateResultSchema.pick({ taskId: true, userId: true })), assignTaskController);
router.delete("/unassign", authentication, validateZodSchema(TaskAssigneeCreateResultSchema.pick({ taskId: true, userId: true })), unassignTaskController);

router.get("/comment/list", authentication, getCommentsController);
router.post("/comment/create", authentication, validateZodSchema(
    TaskCommentUncheckedCreateInputObjectZodSchema
        .omit({ id: true, authorId: true, createdAt: true })
        .extend({ mentionedUserIds: z.array(z.string().uuid()).optional() })
), createCommentController);
router.delete("/comment/delete", authentication, validateZodSchema(
    TaskCommentUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()
), deleteCommentController);

export default router;
