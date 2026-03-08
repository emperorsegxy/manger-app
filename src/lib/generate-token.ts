import crypto from "crypto";

type GeneratedToken = {
    plainToken: string;
    tokenHash: string;
    expiresAt: Date;
};

export const generateToken = (expiresInMs: number): GeneratedToken => {
    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(plainToken).digest("hex");
    const expiresAt = new Date(Date.now() + expiresInMs);
    return { plainToken, tokenHash, expiresAt };
};
