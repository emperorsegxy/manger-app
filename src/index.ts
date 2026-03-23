import "dotenv/config"

import express from "express";
import cors from "cors";
import { setupSwagger } from "../swagger";
import userRouter from "@/routes/user";
import projectRouter from "@/routes/project"
import boardRouter from "@/routes/board"
import taskRouter from "@/routes/task"
import columnRouter from "@/routes/column"
import {requestLogger} from "@/loggers/request-logger";
import path from "node:path";
import fs from "node:fs";

const app = express();


setupSwagger(app);

app.use(cors());
app.use(express.json());

// create logs folder if not existing
const logsFolder = path.join(process.cwd(), "logs");
fs.mkdirSync(logsFolder, { recursive: true });

app.use(requestLogger);

app.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).send("Welcome");
})

app.use('/user', userRouter)
app.use('/project', projectRouter)
app.use('/board', boardRouter)
app.use('/task', taskRouter)
app.use('/column', columnRouter)

const port = process.env.PORT || 3000;

app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Running on ${url}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Docs available at ${url}/docs`);
    }
});
