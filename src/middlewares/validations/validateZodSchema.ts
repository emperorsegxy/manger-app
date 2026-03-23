import type { Request, Response, NextFunction } from 'express'

export const validateZodSchema = (zodSchema: any) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
        return res.status(400).send({
            error: 'Validation failed',
        })
    }
    const result = zodSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            errors: result.error.flatten(),
        });
    }
    req.body = result.data
    next()
}