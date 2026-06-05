import { auditQuerySchema } from "./audit.schema.js";
import * as auditService from "./audit.service.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const filters = auditQuerySchema.parse(req.query);

    const result = await auditService.getAuditLogs({
      tenantId: req.context.tenant.id,
      filters,
    });

    res.json({
      success: true,
      message: "Auditoría obtenida correctamente",
      data: result,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Filtros inválidos",
        errors: error.issues,
      });
    }

    next(error);
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await auditService.getAuditLogById({
      tenantId: req.context.tenant.id,
      auditId: req.params.id,
    });

    res.json({
      success: true,
      message: "Registro de auditoría obtenido correctamente",
      data: log,
    });
  } catch (error) {
    next(error);
  }
};