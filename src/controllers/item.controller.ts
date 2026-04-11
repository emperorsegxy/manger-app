import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getItemList } from "@services/item/get-item-list";
import { createItem } from "@services/item/create-item";
import { updateItem } from "@services/item/update-item";
import { deleteItem } from "@services/item/delete-item";
import { assignItem } from "@services/item/assign-item";
import { unassignItem } from "@services/item/unassign-item";
import { getItemAssignees } from "@services/item/get-item-assignees";
import { getComments } from "@services/item/comment/get-comments";
import { createComment } from "@services/item/comment/create-comment";
import { deleteComment } from "@services/item/comment/delete-comment";
import { createSuccessResponse, createErrorResponse, statusToErrorCode, ErrorCode } from "@/lib/create-api-response";

export const getItemListController = async (req: Request, res: Response) => {
    try {
        const { boardId, columnIds, assigneeIds, typeIds } = req.query;
        if (!boardId || typeof boardId !== "string") {
            return createErrorResponse({ res, statusCode: 400, message: "boardId query param is required", errorCode: ErrorCode.BadRequest });
        }

        const parseIds = (param: unknown): string[] | undefined => {
            if (!param) return undefined;
            const ids = Array.isArray(param) ? param : [param];
            return ids.filter((id): id is string => typeof id === "string");
        };

        const items = await getItemList({
            boardId,
            requestingUserId: req.user!.id,
            columnIds: parseIds(columnIds),
            assigneeIds: parseIds(assigneeIds),
            typeIds: parseIds(typeIds),
        });
        return createSuccessResponse({ res, message: "Successfully retrieved items", data: { items } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createItemController = async (req: Request, res: Response) => {
    try {
        const item = await createItem({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "Successfully created a new item", data: { item } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const updateItemController = async (req: Request, res: Response) => {
    try {
        const item = await updateItem({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully updated item", data: { item } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const deleteItemController = async (req: Request, res: Response) => {
    try {
        await deleteItem({ id: req.body.id, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully deleted item" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const getItemAssigneesController = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.query;
        if (!itemId || typeof itemId !== "string") {
            return createErrorResponse({ res, statusCode: 400, message: "itemId query param is required", errorCode: ErrorCode.BadRequest });
        }
        const assignees = await getItemAssignees({ itemId, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully retrieved assignees", data: { assignees } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const assignItemController = async (req: Request, res: Response) => {
    try {
        const assignment = await assignItem({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "User assigned to item", data: { assignment } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const unassignItemController = async (req: Request, res: Response) => {
    try {
        await unassignItem({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "User unassigned from item" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const getCommentsController = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.query;
        if (!itemId || typeof itemId !== "string") {
            return createErrorResponse({ res, statusCode: 400, message: "itemId query param is required", errorCode: ErrorCode.BadRequest });
        }
        const items = await getComments({ itemId, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully retrieved comments", data: { items } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createCommentController = async (req: Request, res: Response) => {
    try {
        const comment = await createComment({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "Comment added successfully", data: { comment } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const deleteCommentController = async (req: Request, res: Response) => {
    try {
        await deleteComment({ id: req.body.id, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Comment deleted successfully" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};
