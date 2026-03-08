import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getProjectList } from "@services/project/get-project-list";
import { createProject } from "@services/project/create-project";
import { updateProject } from "@services/project/update-project";

export const getProjectListController = async (req: Request, res: Response) => {
    try {
        const items = await getProjectList(req.user!.id);
        res.status(200).send({ message: "Successfully retrieved items", data: { items } });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const createProjectController = async (req: Request, res: Response) => {
    try {
        const project = await createProject({ ...req.body, ownerId: req.user!.id });
        res.status(201).send({ message: "Sucessfully created a new project", data: { project } });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const updateProjectController = async (req: Request, res: Response) => {
    try {
        const project = await updateProject({ ...req.body, ownerId: req.user!.id });
        res.status(201).send({ message: "Sucessfully updated project", data: { project } });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};
