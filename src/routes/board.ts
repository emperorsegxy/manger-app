import express from "express"
import { BoardUncheckedCreateInputObjectZodSchema } from "@generated/zod/schemas"
import authentication from "@/middlewares/authentication"
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema"
import { getBoardListController, createBoardController, updateBoardController, deleteBoardController } from "@/controllers/board.controller"

const router = express.Router()

router.get('/list', authentication, getBoardListController)
router.post('/create', authentication, validateZodSchema(BoardUncheckedCreateInputObjectZodSchema.omit({ columns: true })), createBoardController)
router.patch('/update', authentication, validateZodSchema(BoardUncheckedCreateInputObjectZodSchema.pick({ id: true, name: true })), updateBoardController)
router.delete('/delete', authentication, validateZodSchema(BoardUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteBoardController)

export default router
