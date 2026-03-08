import pino from "pino";
import path from "node:path";

export const logger = pino({
    level: "info",
    transport: {
        target: 'pino/file',
        options: {
            destination: path.join(process.cwd(), "logs/app-logs.log"),
        },
    }
})