import {
  createOperationSchema,
  updateStatusSchema,
  assignOperationSchema,
} from "./operation.schema.js";

import * as operationService from "./operation.service.js";

export const createOperation = async (req, res, next) => {
  try {
    const validatedData = createOperationSchema.parse(req.body);

    const operation = await operationService.createOperation({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      data: validatedData,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "Operación creada correctamente",
      data: operation,
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

export const getOperations = async (req, res, next) => {
  try {
    const operations = await operationService.getOperations({
      tenantId: req.context.tenant.id,
      filters: req.query,
    });

    res.json({
      success: true,
      message: "Operaciones obtenidas correctamente",
      data: operations,
    });
  } catch (error) {
    next(error);
  }
};

export const getOperationById = async (req, res, next) => {
  try {
    const operation = await operationService.getOperationById({
      tenantId: req.context.tenant.id,
      operationId: req.params.id,
    });

    res.json({
      success: true,
      message: "Operación obtenida correctamente",
      data: operation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOperationStatus = async (req, res, next) => {
  try {
    const validatedData = updateStatusSchema.parse(req.body);

    const operation = await operationService.updateOperationStatus({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      operationId: req.params.id,
      data: validatedData,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Estado de operación actualizado correctamente",
      data: operation,
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

export const assignOperation = async (req, res, next) => {
  try {
    const validatedData = assignOperationSchema.parse(req.body);

    const operation = await operationService.assignOperation({
      tenantId: req.context.tenant.id,
      userId: req.context.user.id,
      operationId: req.params.id,
      assignedUserId: validatedData.userId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Operación asignada correctamente",
      data: operation,
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