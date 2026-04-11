import express from "express";
import { ItemTypeUncheckedCreateInputObjectZodSchema } from "@generated/zod/schemas";
import authentication from "@/middlewares/authentication";
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema";
import {
    getItemTypeListController,
    createItemTypeController,
    deleteItemTypeController,
} from "@/controllers/item-type.controller";

const router = express.Router();

router.get("/list", authentication, getItemTypeListController);
router.post("/create", authentication, validateZodSchema(ItemTypeUncheckedCreateInputObjectZodSchema.pick({ name: true, projectId: true }).required({ name: true, projectId: true })), createItemTypeController);
router.delete("/delete", authentication, validateZodSchema(ItemTypeUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteItemTypeController);

export default router;
