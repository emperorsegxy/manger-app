import {pinoHttp} from "pino-http";
import pino from "pino";
import path from "node:path";

const transport = pino.transport({
    target: "pino/file",
    options: {
        destination: path.join(process.cwd(), "logs/network-logs.log"),
    },
    level: 'info',
})

const rqLogger = pino(transport)

export const requestLogger = pinoHttp({
    logger: rqLogger
})