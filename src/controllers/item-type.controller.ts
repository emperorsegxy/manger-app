import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getItemTypeList } from "@services/item-type/get-item-type-list";
import { createItemType } from "@services/item-type/create-item-type";
import { deleteItemType } from "@services/item-type/delete-item-type";
import { createSuccessResponse, createErrorResponse, statusToErrorCode, ErrorCode } from "@/lib/create-api-response";

export const getItemTypeListController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.query;
        if (!projectId || typeof projectId !== "string") {
            return createErrorResponse({ res, statusCode: 400, message: "projectId query param is required", errorCode: ErrorCode.BadRequest });
        }
        const itemTypes = await getItemTypeList({ projectId, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully retrieved item types", data: { itemTypes } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createItemTypeController = async (req: Request, res: Response) => {
    try {
        const itemType = await createItemType({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "Item type created successfully", data: { itemType } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const deleteItemTypeController = async (req: Request, res: Response) => {
    try {
        await deleteItemType({ id: req.body.id, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Item type deleted successfully" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};
