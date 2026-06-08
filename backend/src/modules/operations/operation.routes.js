import { Router } from "express";

import * as operationController from "./operation.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  canAccess,
  requirePermission,
} from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

const getRequiredStatusPermission = (status) => {
  if (status === "COMPLETED") {
    return "operations:complete";
  }

  if (status === "CANCELLED") {
    return "operations:cancel";
  }

  return "operations:update";
};

const requireStatusPermission = (req, res, next) => {
  const requestedStatus = req.body?.status;

  if (!requestedStatus) {
    return next();
  }

  const requiredPermission = getRequiredStatusPermission(requestedStatus);

  if (canAccess.permission(req, requiredPermission)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: `No tiene permisos para cambiar la operación al estado ${requestedStatus}`,
    requiredPermission,
  });
};

/**
 * @swagger
 * /api/operations:
 *   get:
 *     summary: Listar operaciones
 *     description: Obtiene las operaciones del tenant actual. Permite filtrar por estado, tipo, cliente, prioridad o usuario asignado.
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED]
 *         example: PENDING
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [TASK, WORK_ORDER, INCIDENT, INSPECTION, SERVICE_REQUEST]
 *         example: TASK
 *       - in: query
 *         name: priority
 *         required: false
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         example: MEDIUM
 *       - in: query
 *         name: clientId
 *         required: false
 *         schema:
 *           type: string
 *         example: cmq0fnnca0000zc9wk27knn2x
 *       - in: query
 *         name: assignedToId
 *         required: false
 *         schema:
 *           type: string
 *         example: cmq09d8iv00010s9wnasvzgxz
 *     responses:
 *       200:
 *         description: Operaciones obtenidas correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar operaciones.
 */
router.get(
  "/",
  requirePermission("operations:read"),
  operationController.getOperations
);

/**
 * @swagger
 * /api/operations:
 *   post:
 *     summary: Crear operación
 *     description: Crea una nueva tarea, orden de trabajo, incidente, inspección o solicitud de servicio.
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  requirePermission("operations:create"),
  operationController.createOperation
);

/**
 * @swagger
 * /api/operations/{id}:
 *   get:
 *     summary: Obtener operación por ID
 *     description: Obtiene el detalle de una operación específica del tenant actual.
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id",
  requirePermission("operations:read"),
  operationController.getOperationById
);

/**
 * @swagger
 * /api/operations/{id}/status:
 *   patch:
 *     summary: Cambiar estado de operación
 *     description: Actualiza el estado de una operación y registra historial, auditoría y notificación. Para completar se requiere operations:complete, para cancelar se requiere operations:cancel y para estados intermedios se requiere operations:update.
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/status",
  requireStatusPermission,
  operationController.updateOperationStatus
);

/**
 * @swagger
 * /api/operations/{id}/assign:
 *   patch:
 *     summary: Asignar operación a usuario
 *     description: Asigna una operación a un usuario activo perteneciente al tenant actual.
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/assign",
  requirePermission("operations:assign"),
  operationController.assignOperation
);

export default router;
