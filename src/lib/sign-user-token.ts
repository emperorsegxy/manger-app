import { UserPureType } from "@generated/zod/schemas";
import jwt from "jsonwebtoken"
import "dotenv/config"

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

export const signUserToken = (user: Omit<UserPureType, "password">) => {

    const signedToken = jwt.sign(user, JWT_SECRET_KEY as string, {algorithm: 'HS256', expiresIn: '1d'})
    return signedToken
}