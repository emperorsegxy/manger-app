import bcrptjs from "bcrypt"
import "dotenv/config"

const HASH_SECRET = process.env.HASH_SECRET

export const hashPassword = async (password: string, saltRounds = 10): Promise<string> => {
    const salt = await bcrptjs.genSalt(saltRounds)
    const hash = await bcrptjs.hash(password, salt)
    return hash
}