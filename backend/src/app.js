import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { env } from "./config/env.js";
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

app.disable("x-powered-by");
app.set("trust proxy", 1);

const localApiOrigin = `http://localhost:${env.port}`;

const corsOrigins = [
  ...env.corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  ...(env.nodeEnv !== "production" ? [localApiOrigin] : []),
];

const allowedCorsOrigins = [...new Set(corsOrigins)];

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
      if (!origin || allowedCorsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"), {
    maxAge: env.nodeEnv === "production" ? "7d" : 0,
    index: false,
  })
);

setupSwagger(app);

app.get("/health", (req, res) => {
  return res.json({
    success: true,
    message: "NexoCore API funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => {
  return res.json({
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