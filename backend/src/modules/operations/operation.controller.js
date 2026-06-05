import { ZodError } from "zod";

import {
  createOperationSchema,
  updateStatusSchema,
  assignOperationSchema,
} from "./operation.schema.js";

import * as operationService from "./operation.service.js";

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

export const createOperation = async (req, res, next) => {
  try {
    const validatedData = createOperationSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const operation = await operationService.createOperation({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      data: validatedData,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.status(201).json({
      success: true,
      message: "Operación creada correctamente",
      data: operation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const getOperations = async (req, res, next) => {
  try {
    const operations = await operationService.getOperations({
      tenantId: req.context.tenant.id,
      filters: req.query,
    });

    return res.json({
      success: true,
      message: "Operaciones obtenidas correctamente",
      data: operations,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOperationById = async (req, res, next) => {
  try {
    const operation = await operationService.getOperationById({
      tenantId: req.context.tenant.id,
      operationId: req.params.id,
    });

    return res.json({
      success: true,
      message: "Operación obtenida correctamente",
      data: operation,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOperationStatus = async (req, res, next) => {
  try {
    const validatedData = updateStatusSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const operation = await operationService.updateOperationStatus({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      operationId: req.params.id,
      data: validatedData,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.json({
      success: true,
      message: "Estado de operación actualizado correctamente",
      data: operation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const assignOperation = async (req, res, next) => {
  try {
    const validatedData = assignOperationSchema.parse(req.body);
    const metadata = getRequestMetadata(req);

    const operation = await operationService.assignOperation({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      operationId: req.params.id,
      assignedUserId: validatedData.userId,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    return res.json({
      success: true,
      message: "Operación asignada correctamente",
      data: operation,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};