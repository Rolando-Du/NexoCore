export const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
};

export const errorMiddleware = (error, req, res, next) => {
  console.error("ERROR:", error);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Error interno del servidor",
  });
};