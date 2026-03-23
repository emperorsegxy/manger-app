import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getBoardList } from "@services/board/get-board-list";
import { createBoard } from "@services/board/create-board";
import { updateBoard } from "@services/board/update-board";
import { deleteBoard } from "@services/board/delete-board";
import { createSuccessResponse, createErrorResponse, statusToErrorCode, ErrorCode } from "@/lib/create-api-response";

export const getBoardListController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.query;
        if (!projectId || typeof projectId !== "string") {
            return createErrorResponse({ res, statusCode: 400, message: "projectId query param is required", errorCode: ErrorCode.BadRequest });
        }
        const items = await getBoardList({ projectId, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully retrieved items", data: { items } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createBoardController = async (req: Request, res: Response) => {
    try {
        const board = await createBoard({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "Successfully created a new board", data: { board } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        console.log({err})
        return createErrorResponse({ res });
    }
};

export const updateBoardController = async (req: Request, res: Response) => {
    try {
        const board = await updateBoard({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully updated board", data: { board } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const deleteBoardController = async (req: Request, res: Response) => {
    try {
        await deleteBoard({ id: req.body.id, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully deleted board" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};
