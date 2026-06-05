import multer from "multer";
import { Prisma } from "@prisma/client";

export const notFoundMiddleware = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
};

export const errorMiddleware = (error, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error("ERROR:", error);
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "El archivo supera el tamaño máximo permitido de 10 MB",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Solo se permite subir un archivo por solicitud",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Error al procesar el archivo",
      code: error.code,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Ya existe un registro con esos datos",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Error de base de datos",
      code: error.code,
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "El cuerpo de la solicitud no tiene un JSON válido",
    });
  }

  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origen no permitido por CORS",
    });
  }

  const statusCode = error.statusCode || error.status || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && isProduction
        ? "Error interno del servidor"
        : error.message || "Error interno del servidor",
  });
};