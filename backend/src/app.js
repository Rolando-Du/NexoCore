import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

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

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/operations", operationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/attachments", attachmentRoutes);

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
    auth: "/api/auth/register-tenant",
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;