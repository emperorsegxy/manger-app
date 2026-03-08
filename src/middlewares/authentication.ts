import { verifyToken } from "@/lib/verify-token"
import type { Request, Response, NextFunction } from "express"

export default function authentication(req: Request, res: Response, next: NextFunction) {
    let token = req.headers['authorization'] || req.query?.token || req.body?.token
    console.log(req, 'req')

    if (req.headers['authorization'] && typeof req.headers['authorization'] === 'string') {
        token = token.split(/\s/)?.[1]
    }
    try {
        const decoded = verifyToken(token)
        console.log(decoded, 'decoded')
        req.user = decoded as Express.Request["user"]
        next()
    } catch (e: any) {
        res.status(401).send({
            message: "Could not verify your token."
        })
    }
}