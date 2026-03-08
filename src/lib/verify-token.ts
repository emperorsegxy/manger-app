import jwt from "jsonwebtoken"
import "dotenv/config"

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

export const verifyToken = (token: string) => {
    const decoded = jwt.verify(token, JWT_SECRET_KEY as any)
    return decoded
}