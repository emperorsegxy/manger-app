import express from "express";
import { ColumnUncheckedCreateInputObjectZodSchema } from "@generated/zod/schemas/objects/ColumnUncheckedCreateInput.schema";
import authentication from "@/middlewares/authentication";
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema";
import { getColumnListController, createColumnController, createManyColumnsController, updateColumnController, deleteColumnController } from "@/controllers/column.controller";

const router = express.Router();

router.get("/list", authentication, getColumnListController);
router.post("/create", authentication, validateZodSchema(ColumnUncheckedCreateInputObjectZodSchema.pick({ name: true, boardId: true, order: true })), createColumnController);
router.post("/create-many", authentication, createManyColumnsController);
router.patch("/update", authentication, validateZodSchema(ColumnUncheckedCreateInputObjectZodSchema.pick({ id: true, name: true, order: true }).required({ id: true }).partial({ name: true, order: true })), updateColumnController);
router.delete("/delete", authentication, validateZodSchema(ColumnUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteColumnController);

export default router;
