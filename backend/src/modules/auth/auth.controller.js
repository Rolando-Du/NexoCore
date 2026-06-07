import { ZodError } from "zod";

import { registerTenantSchema, loginSchema } from "./auth.schema.js";

import * as authService from "./auth.service.js";

const handleZodError = (error, res) => {
  return res.status(400).json({
    success: false,
    message: "Datos inválidos",
    errors: error.issues,
  });
};

const getRequestMetadata = (req) => {
  return {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };
};

export const registerTenant = async (req, res, next) => {
  try {
    const validatedData = registerTenantSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const result = await authService.registerTenant({
      ...validatedData,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.status(201).json({
      success: true,
      message: "Empresa y usuario administrador creados correctamente",
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const result = await authService.login({
      ...validatedData,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.json({
      success: true,
      message: "Login correcto",
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const me = async (req, res) => {
  return res.json({
    success: true,
    message: "Usuario autenticado correctamente",
    data: req.context,
  });
};