import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getTaskList } from "@services/task/get-task-list";
import { createTask } from "@services/task/create-task";
import { updateTask } from "@services/task/update-task";
import { deleteTask } from "@services/task/delete-task";
import { assignTask } from "@services/task/assign-task";
import { unassignTask } from "@services/task/unassign-task";
import { createSuccessResponse, createErrorResponse, statusToErrorCode, ErrorCode } from "@/lib/create-api-response";

export const getTaskListController = async (req: Request, res: Response) => {
    try {
        const { columnId } = req.query;
        if (!columnId || typeof columnId !== "string") {
            return createErrorResponse({ res, statusCode: 400, message: "columnId query param is required", errorCode: ErrorCode.BadRequest });
        }
        const items = await getTaskList({ columnId, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully retrieved items", data: { items } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createTaskController = async (req: Request, res: Response) => {
    try {
        const task = await createTask({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "Successfully created a new task", data: { task } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const updateTaskController = async (req: Request, res: Response) => {
    try {
        const task = await updateTask({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully updated task", data: { task } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const deleteTaskController = async (req: Request, res: Response) => {
    try {
        await deleteTask({ id: req.body.id, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully deleted task" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const assignTaskController = async (req: Request, res: Response) => {
    try {
        const assignment = await assignTask({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "User assigned to task", data: { assignment } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const unassignTaskController = async (req: Request, res: Response) => {
    try {
        await unassignTask({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "User unassigned from task" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};
