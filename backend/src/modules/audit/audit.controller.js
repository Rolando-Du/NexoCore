import { ZodError } from "zod";

import { auditQuerySchema } from "./audit.schema.js";
import * as auditService from "./audit.service.js";

const handleZodError = (error, res) => {
  return res.status(400).json({
    success: false,
    message: "Filtros inválidos",
    errors: error.issues,
  });
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const filters = auditQuerySchema.parse(req.query);

    const result = await auditService.getAuditLogs({
      tenantId: req.context.tenant.id,
      filters,
    });

    return res.json({
      success: true,
      message: "Auditoría obtenida correctamente",
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, res);
    }

    return next(error);
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await auditService.getAuditLogById({
      tenantId: req.context.tenant.id,
      auditId: req.params.id,
    });

    return res.json({
      success: true,
      message: "Registro de auditoría obtenido correctamente",
      data: log,
    });
  } catch (error) {
    return next(error);
  }
};