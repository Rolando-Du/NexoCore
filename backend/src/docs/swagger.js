import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { env } from "../config/env.js";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NexoCore API",
      version: "1.0.0",
      description:
        "Documentación oficial de la API REST de NexoCore, plataforma SaaS empresarial para gestión de clientes, operaciones, evidencias, notificaciones y auditoría.",
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: "Servidor local de desarrollo",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Autenticación, registro de tenant y sesión de usuario.",
      },
      {
        name: "Clients",
        description: "Gestión de clientes, contactos y ubicaciones.",
      },
      {
        name: "Operations",
        description: "Gestión de operaciones, estados y asignaciones.",
      },
      {
        name: "Attachments",
        description: "Carga y consulta de evidencias asociadas a operaciones.",
      },
      {
        name: "Notifications",
        description: "Notificaciones internas del usuario autenticado.",
      },
      {
        name: "Audit",
        description: "Consulta de registros de auditoría del tenant.",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Ingresar el token JWT con el formato: Bearer {token}",
        },
      },
    },
  },
  apis: ["./src/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: "NexoCore API Docs",
  swaggerOptions: {
    persistAuthorization: true,
  },
};

export const setupSwagger = (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
};