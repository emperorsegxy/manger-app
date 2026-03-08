import "dotenv/config"
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "node:path";
import YAML from "yamljs"

// const cf = import.meta.url

const swaggerYamlPath = path.join(__dirname, './src/swagger/docs/swagger.yaml')

const swaggerJsFromYaml = YAML.load(swaggerYamlPath)


// const options = {
//     definition: {
//         openapi: "3.0.0",
//         info: {
//             title: "Manger-Kanban",
//             version: "1.0.0",
//             description: "API documentation",
//         },
//         servers: [
//             {
//                 url: "http://localhost:" + process.env.PORT,
//             },
//         ],
//     },
//     apis: ["./src/routes/*.ts"], // path to your route files
// };



// const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsFromYaml));
}