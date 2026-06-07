import { Router } from "express";

import * as auditController from "./audit.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Listar registros de auditoría
 *     description: Obtiene registros de auditoría del tenant actual. Permite filtrar por módulo, acción, usuario, entidad, entidad relacionada y rango de fechas.
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         required: false
 *         description: Módulo donde ocurrió el evento.
 *         schema:
 *           type: string
 *         example: operations
 *       - in: query
 *         name: action
 *         required: false
 *         description: Acción auditada.
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT, READ, ASSIGN, STATUS_CHANGE]
 *         example: STATUS_CHANGE
 *       - in: query
 *         name: userId
 *         required: false
 *         description: ID del usuario que ejecutó la acción.
 *         schema:
 *           type: string
 *         example: cmq09d8iv00010s9wnasvzgxz
 *       - in: query
 *         name: entity
 *         required: false
 *         description: Entidad afectada.
 *         schema:
 *           type: string
 *         example: Operation
 *       - in: query
 *         name: entityId
 *         required: false
 *         description: ID de la entidad afectada.
 *         schema:
 *           type: string
 *         example: cmq1dych50000ww9wqyuz78h1
 *       - in: query
 *         name: dateFrom
 *         required: false
 *         description: Fecha inicial del filtro.
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2026-06-01T00:00:00.000Z
 *       - in: query
 *         name: dateTo
 *         required: false
 *         description: Fecha final del filtro.
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2026-06-30T23:59:59.999Z
 *       - in: query
 *         name: take
 *         required: false
 *         description: Cantidad de registros a obtener. Máximo 100.
 *         schema:
 *           type: number
 *         example: 50
 *       - in: query
 *         name: skip
 *         required: false
 *         description: Cantidad de registros a saltear.
 *         schema:
 *           type: number
 *         example: 0
 *     responses:
 *       200:
 *         description: Auditoría obtenida correctamente.
 *       400:
 *         description: Filtros inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar auditoría.
 */
router.get(
  "/",
  requirePermission("audit:read"),
  auditController.getAuditLogs
);

/**
 * @swagger
 * /api/audit/{id}:
 *   get:
 *     summary: Obtener registro de auditoría por ID
 *     description: Obtiene el detalle de un registro de auditoría específico perteneciente al tenant actual.
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del registro de auditoría.
 *         schema:
 *           type: string
 *         example: cmq1dyci90002ww9wjs0hvzru
 *     responses:
 *       200:
 *         description: Registro de auditoría obtenido correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar auditoría.
 *       404:
 *         description: Registro de auditoría no encontrado.
 */
router.get(
  "/:id",
  requirePermission("audit:read"),
  auditController.getAuditLogById
);

export default router;