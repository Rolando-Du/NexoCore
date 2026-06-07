import { ZodError } from "zod";

import { createUserSchema, updateUserSchema } from "./user.schema.js";
import * as userService from "./user.service.js";

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

export const getTenantRoles = async (req, res, next) => {
  try {
    const roles = await userService.getTenantRoles({
      tenantId: req.context.tenant.id,
    });

    return res.json({
      success: true,
      message: "Roles obtenidos correctamente",
      data: roles,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers({
      tenantId: req.context.tenant.id,
    });

    return res.json({
      success: true,
      message: "Usuarios obtenidos correctamente",
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById({
      tenantId: req.context.tenant.id,
      userId: req.params.id,
    });

    return res.json({
      success: true,
      message: "Usuario obtenido correctamente",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const user = await userService.createUser({
      tenantId: req.context.tenant.id,
      currentUserId: req.context.user.id,
      data: validatedData,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.status(201).json({
      success: true,
      message: "Usuario creado correctamente",
      data: user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const user = await userService.updateUser({
      tenantId: req.context.tenant.id,
      currentUserId: req.context.user.id,
      userId: req.params.id,
      data: validatedData,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const disableUser = async (req, res, next) => {
  try {
    const metadata = getRequestMetadata(req);

    const user = await userService.disableUser({
      tenantId: req.context.tenant.id,
      currentUserId: req.context.user.id,
      userId: req.params.id,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.json({
      success: true,
      message: "Usuario deshabilitado correctamente",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};