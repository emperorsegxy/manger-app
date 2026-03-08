import express from "express";
import { TaskUncheckedCreateInputObjectZodSchema } from "@generated/zod/schemas";
import authentication from "@/middlewares/authentication";
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema";
import { getTaskListController, createTaskController, updateTaskController, deleteTaskController } from "@/controllers/task.controller";

const router = express.Router();

router.get("/list", authentication, getTaskListController);
router.post("/create", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.omit({ id: true, order: true })), createTaskController);
router.patch("/update", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.partial().required({ id: true })), updateTaskController);
router.delete("/delete", authentication, validateZodSchema(TaskUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteTaskController);

export default router;
