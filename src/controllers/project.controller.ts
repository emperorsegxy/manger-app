import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getProjectList } from "@services/project/get-project-list";
import { createProject } from "@services/project/create-project";
import { updateProject } from "@services/project/update-project";
import { deleteProject } from "@services/project/delete-project";
import { createSuccessResponse, createErrorResponse, statusToErrorCode } from "@/lib/create-api-response";

export const getProjectListController = async (req: Request, res: Response) => {
    try {
        const items = await getProjectList(req.user!.id);
        return createSuccessResponse({ res, message: "Successfully retrieved items", data: { items } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const createProjectController = async (req: Request, res: Response) => {
    try {
        const project = await createProject({ ...req.body, ownerId: req.user!.id });
        return createSuccessResponse({ res, statusCode: 201, message: "Successfully created a new project", data: { project } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const updateProjectController = async (req: Request, res: Response) => {
    try {
        const project = await updateProject({ ...req.body, ownerId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully updated project", data: { project } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const deleteProjectController = async (req: Request, res: Response) => {
    try {
        await deleteProject({ id: req.body.id, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Successfully deleted project" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};
