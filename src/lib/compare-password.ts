import bcryptjs from "bcrypt"


type PasswordComparePayload = { hashedPassword: string; givenPassword: string }

export const comparePassword = async ({ hashedPassword, givenPassword }: PasswordComparePayload) =>
    await bcryptjs.compare(givenPassword, hashedPassword)