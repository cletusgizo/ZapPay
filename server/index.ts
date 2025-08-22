import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleRegister } from "./routes/register";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export function createServer() {
  const app = express();

  // Swagger definition
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "ZapPay API",
        version: "1.0.0",
        description: "API documentation for ZapPay application",
      },
      components: {
        schemas: {
          RegisterRequest: {
            type: "object",
            properties: {
              phone: {
                type: "string",
                description: "User's phone number"
              },
              otp: {
                type: "string",
                description: "One-time password for verification"
              },
              password: {
                type: "string",
                description: "User's password"
              },
              walletAddress: {
                type: "string",
                description: "User's wallet address"
              }
            },
            required: ["phone", "otp", "password", "walletAddress"]
          },
          RegisterResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: "Indicates if the registration was successful"
              },
              message: {
                type: "string",
                description: "Response message"
              },
              userId: {
                type: "string",
                description: "User ID (if successful)"
              },
              token: {
                type: "string",
                description: "Authentication token (if successful)"
              }
            },
            required: ["success", "message"]
          }
        }
      },
      servers: [
        {
          url: "http://localhost:8080",
          description: "Development server"
        }
      ]
    },
    apis: ["./server/routes/*.ts"], // Path to the API docs
  };

  const specs = swaggerJsdoc(options);
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  
  // Registration route
  app.post("/api/register", handleRegister);

  return app;
}
