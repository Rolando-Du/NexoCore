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
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         example: operations
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT, READ, ASSIGN, STATUS_CHANGE]
 *         example: STATUS_CHANGE
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         example: Operation
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *       - in: query
 *         name: take
 *         schema:
 *           type: number
 *         example: 50
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         example: 0
 *     responses:
 *       200:
 *         description: Auditoría obtenida correctamente
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
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del registro de auditoría
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro de auditoría obtenido correctamente
 *       404:
 *         description: Registro de auditoría no encontrado
 */
router.get(
  "/:id",
  requirePermission("audit:read"),
  auditController.getAuditLogById
);

export default router;