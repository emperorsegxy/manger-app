import type { Request, Response } from "express";
import { AppError } from "@/errors/AppError";
import { getBoardList } from "@services/board/get-board-list";
import { createBoard } from "@services/board/create-board";
import { updateBoard } from "@services/board/update-board";

export const getBoardListController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.query;
        if (!projectId || typeof projectId !== "string") {
            return res.status(400).json({ message: "projectId query param is required" });
        }
        const items = await getBoardList({ projectId, requestingUserId: req.user!.id });
        res.status(200).send({ message: "Successfully retrieved items", data: { items } });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const createBoardController = async (req: Request, res: Response) => {
    try {
        const board = await createBoard({ ...req.body, requestingUserId: req.user!.id });
        res.status(201).send({ message: "Successfully created a new board", data: { board } });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};

export const updateBoardController = async (req: Request, res: Response) => {
    try {
        const board = await updateBoard({ ...req.body, requestingUserId: req.user!.id });
        res.status(200).send({ message: "Successfully updated board", data: { board } });
    } catch (err) {
        if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
        res.status(500).json({ message: "An unhandled error has occurred" });
    }
};
