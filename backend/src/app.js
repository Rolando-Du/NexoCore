import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { setupSwagger } from "./docs/swagger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import clientRoutes from "./modules/clients/client.routes.js";
import operationRoutes from "./modules/operations/operation.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import attachmentRoutes from "./modules/attachments/attachment.routes.js";

import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";

const app = express();

const corsOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  "/uploads",
  express.static(path.resolve("uploads"), {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
  })
);

setupSwagger(app);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "NexoCore API funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a NexoCore API",
    docs: "/api/docs",
    health: "/health",
    auth: "/api/auth/register-tenant",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/operations", operationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/attachments", attachmentRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;