import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getColumnList } from "@services/column/get-column-list";
import { createColumn, createManyColumns } from "@services/column/create-column";
import { updateColumn } from "@services/column/update-column";
import { deleteColumn } from "@services/column/delete-column";
import { createSuccessResponse, createErrorResponse, statusToErrorCode, ErrorCode } from "@/lib/create-api-response";

export const getColumnListController = async (req: Request, res: Response) => {
    try {
        const { boardId } = req.query;
        if (!boardId || typeof boardId !== "string") {
            return createErrorResponse({ res, statusCode: 400, message: "boardId query param is required", errorCode: ErrorCode.BadRequest });
        }
        const items = await getColumnList({ boardId, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully retrieved items", data: { items } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createColumnController = async (req: Request, res: Response) => {
    try {
        const column = await createColumn({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "Successfully created a new column", data: { column } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createManyColumnsController = async (req: Request, res: Response) => {
    try {
        const columns = await createManyColumns({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "Successfully created columns", data: { columns } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const updateColumnController = async (req: Request, res: Response) => {
    try {
        const column = await updateColumn({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully updated column", data: { column } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const deleteColumnController = async (req: Request, res: Response) => {
    try {
        await deleteColumn({ id: req.body.id, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully deleted column" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};
