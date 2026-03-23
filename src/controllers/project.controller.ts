import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getProjectList } from "@services/project/get-project-list";
import { createProject } from "@services/project/create-project";
import { updateProject } from "@services/project/update-project";
import { deleteProject } from "@services/project/delete-project";
import { inviteMember } from "@services/project/invite-member";
import { acceptInvitation } from "@services/project/accept-invitation";
import { removeMember } from "@services/project/remove-member";
import { updateMemberRole } from "@services/project/update-member-role";
import { createSuccessResponse, createErrorResponse, statusToErrorCode, ErrorCode } from "@/lib/create-api-response";
import {getProjectMembers} from "@services/project/get-project-members";

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

export const inviteMemberController = async (req: Request, res: Response) => {
    try {
        await inviteMember({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Invitation sent successfully" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const acceptInvitationController = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            return createErrorResponse({ res, statusCode: 400, message: "token query param is required", errorCode: ErrorCode.BadRequest });
        }
        const membership = await acceptInvitation({ token });
        return createSuccessResponse({ res, statusCode: 201, message: "Successfully joined project", data: { membership } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const removeMemberController = async (req: Request, res: Response) => {
    try {
        await removeMember({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Member removed successfully" });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const updateMemberRoleController = async (req: Request, res: Response) => {
    try {
        const membership = await updateMemberRole({ ...req.body, requestingUserId: req.user!.id });
        return createSuccessResponse({ res, message: "Member role updated successfully", data: { membership } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res, message: err.message, statusCode: err.statusCode, errorCode: statusToErrorCode(err.statusCode) });
        return createErrorResponse({ res });
    }
};

export const getProjectMembersController = async (req: Request, res: Response) => {
    try {
        const members = await getProjectMembers(req.query.projectId as string);
        return createSuccessResponse({ res, message: "Returned project members", data: { members } });
    } catch (err) {
        if (err instanceof AppError) return createErrorResponse({ res });
        return createErrorResponse({ res });
    }
}
