import express from "express";
import {
    ItemUncheckedCreateInputObjectZodSchema,
    ItemAssigneeCreateResultSchema,
    ItemCommentUncheckedCreateInputObjectZodSchema,
} from "@generated/zod/schemas";
import { z } from "zod";
import authentication from "@/middlewares/authentication";
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema";
import {
    getItemListController,
    createItemController,
    updateItemController,
    deleteItemController,
    getItemAssigneesController,
    assignItemController,
    unassignItemController,
    getCommentsController,
    createCommentController,
    deleteCommentController,
} from "@/controllers/item.controller";

const router = express.Router();

router.get("/list", authentication, getItemListController);
router.post("/create", authentication, validateZodSchema(ItemUncheckedCreateInputObjectZodSchema.omit({ id: true, order: true, creatorId: true })), createItemController);
router.patch("/update", authentication, validateZodSchema(ItemUncheckedCreateInputObjectZodSchema.omit({ creatorId: true }).partial().required({ id: true })), updateItemController);
router.delete("/delete", authentication, validateZodSchema(ItemUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteItemController);

router.get("/assignees", authentication, getItemAssigneesController);
router.post("/assign", authentication, validateZodSchema(ItemAssigneeCreateResultSchema.pick({ itemId: true, userId: true })), assignItemController);
router.delete("/unassign", authentication, validateZodSchema(ItemAssigneeCreateResultSchema.pick({ itemId: true, userId: true })), unassignItemController);

router.get("/comment/list", authentication, getCommentsController);
router.post("/comment/create", authentication, validateZodSchema(
    ItemCommentUncheckedCreateInputObjectZodSchema
        .omit({ id: true, authorId: true, createdAt: true })
        .extend({ mentionedUserIds: z.array(z.string().uuid()).optional() })
), createCommentController);
router.delete("/comment/delete", authentication, validateZodSchema(
    ItemCommentUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()
), deleteCommentController);

export default router;
