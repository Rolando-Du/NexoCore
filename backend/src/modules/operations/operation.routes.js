import { Router } from "express";

import * as operationController from "./operation.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

const getPermissionKeys = (req) => {
  return (req.context?.permissions || [])
    .map((permission) => {
      if (typeof permission === "string") return permission;
      return permission?.key;
    })
    .filter(Boolean);
};

const hasPermission = (req, permissionKey) => {
  const permissions = getPermissionKeys(req);

  return permissions.includes(permissionKey);
};

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

  if (hasPermission(req, requiredPermission)) {
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *             properties:
 *               clientId:
 *                 type: string
 *                 nullable: true
 *                 example: cmq0fnnca0000zc9wk27knn2x
 *               type:
 *                 type: string
 *                 enum: [TASK, WORK_ORDER, INCIDENT, INSPECTION, SERVICE_REQUEST]
 *                 example: TASK
 *               title:
 *                 type: string
 *                 example: Revisión de tablero eléctrico
 *               description:
 *                 type: string
 *                 example: Control general del tablero y registro de evidencia.
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 example: MEDIUM
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2026-06-10T10:00:00.000Z
 *               assignedToId:
 *                 type: string
 *                 nullable: true
 *                 example: cmq09d8iv00010s9wnasvzgxz
 *     responses:
 *       201:
 *         description: Operación creada correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para crear operaciones.
 *       404:
 *         description: Cliente no encontrado o usuario asignado no pertenece a la empresa.
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la operación.
 *         schema:
 *           type: string
 *         example: cmq1dych50000ww9wqyuz78h1
 *     responses:
 *       200:
 *         description: Operación obtenida correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar la operación.
 *       404:
 *         description: Operación no encontrada.
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la operación.
 *         schema:
 *           type: string
 *         example: cmq1dych50000ww9wqyuz78h1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED]
 *                 example: IN_PROGRESS
 *               note:
 *                 type: string
 *                 example: Se inicia la tarea desde Swagger.
 *     responses:
 *       200:
 *         description: Estado de operación actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para aplicar el estado solicitado.
 *       404:
 *         description: Operación no encontrada.
 *       409:
 *         description: La operación ya se encuentra en el estado indicado.
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la operación.
 *         schema:
 *           type: string
 *         example: cmq1dych50000ww9wqyuz78h1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: cmq09d8iv00010s9wnasvzgxz
 *     responses:
 *       200:
 *         description: Operación asignada correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para asignar operaciones o el usuario asignado no está activo.
 *       404:
 *         description: Operación no encontrada o usuario no pertenece a la empresa.
 *       409:
 *         description: La operación ya está asignada a este usuario.
 */
router.patch(
  "/:id/assign",
  requirePermission("operations:assign"),
  operationController.assignOperation
);

export default router;