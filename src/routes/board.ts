import express from "express"
import { BoardUncheckedCreateInputObjectZodSchema, ColumnCreateManyBoardInputObjectZodSchema } from "@generated/zod/schemas"
import authentication from "@/middlewares/authentication"
import { validateZodSchema } from "@/middlewares/validations/validateZodSchema"
import { getBoardListController, createBoardController, updateBoardController, deleteBoardController } from "@/controllers/board.controller"

const router = express.Router()

// const validateNestedColumnSchema = (req: express.Request, res: express.Response, next: express.NextFunction) => {

// }

// const Board = zod.

router.get('/list', authentication, getBoardListController)
router.post('/create', authentication, validateZodSchema(BoardUncheckedCreateInputObjectZodSchema.omit({ id: true, columns: true }).extend({ columns: ColumnCreateManyBoardInputObjectZodSchema.omit({ id: true }).array().optional() })), createBoardController)
router.patch('/update', authentication, validateZodSchema(BoardUncheckedCreateInputObjectZodSchema.pick({ id: true, name: true })), updateBoardController)
router.delete('/delete', authentication, validateZodSchema(BoardUncheckedCreateInputObjectZodSchema.pick({ id: true }).required()), deleteBoardController)

export default router
