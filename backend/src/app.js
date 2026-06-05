import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { setupSwagger } from "./docs/swagger.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

setupSwagger(app);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "NexoCore API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a NexoCore API",
    docs: "/api/docs",
    health: "/health",
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;