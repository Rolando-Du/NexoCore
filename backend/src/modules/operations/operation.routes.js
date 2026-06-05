import { Router } from "express";

import * as operationController from "./operation.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/operations:
 *   get:
 *     summary: Listar operaciones
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operaciones obtenidas correctamente
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
 *                 example: cmq0ducze0001zg9wkloe1xqg
 *               type:
 *                 type: string
 *                 example: WORK_ORDER
 *               title:
 *                 type: string
 *                 example: Reparación de equipo principal
 *               description:
 *                 type: string
 *                 example: Revisar equipo y registrar evidencia del mantenimiento.
 *               priority:
 *                 type: string
 *                 example: HIGH
 *               scheduledAt:
 *                 type: string
 *                 example: 2026-06-10T10:00:00.000Z
 *               assignedToId:
 *                 type: string
 *                 example: cmq09d8iv00010s9wnasvzgxz
 *     responses:
 *       201:
 *         description: Operación creada correctamente
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
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la operación
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operación obtenida correctamente
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
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la operación
 *         schema:
 *           type: string
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
 *                 example: IN_PROGRESS
 *               note:
 *                 type: string
 *                 example: Se inicia la tarea en campo.
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 */
router.patch(
  "/:id/status",
  requirePermission("operations:update"),
  operationController.updateOperationStatus
);

/**
 * @swagger
 * /api/operations/{id}/assign:
 *   patch:
 *     summary: Asignar operación a usuario
 *     tags:
 *       - Operations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la operación
 *         schema:
 *           type: string
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
 *         description: Operación asignada correctamente
 */
router.patch(
  "/:id/assign",
  requirePermission("operations:assign"),
  operationController.assignOperation
);

export default router;