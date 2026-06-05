import { registerTenantSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";

export const registerTenant = async (req, res, next) => {
  try {
    const validatedData = registerTenantSchema.parse(req.body);

    const result = await authService.registerTenant({
      ...validatedData,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "Empresa y usuario administrador creados correctamente",
      data: result,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: error.issues,
      });
    }

    next(error);
  }
};