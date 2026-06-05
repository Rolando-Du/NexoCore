import { Router } from "express";

import * as notificationController from "./notification.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     summary: Listar mis notificaciones
 *     description: Obtiene las notificaciones del usuario autenticado dentro del tenant actual. Permite filtrar por estado, tipo y paginar resultados.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         description: Estado de la notificación.
 *         schema:
 *           type: string
 *           enum: [UNREAD, READ, ARCHIVED]
 *         example: UNREAD
 *       - in: query
 *         name: type
 *         required: false
 *         description: Tipo de notificación.
 *         schema:
 *           type: string
 *         example: OPERATION_STATUS_CHANGED
 *       - in: query
 *         name: take
 *         required: false
 *         description: Cantidad de registros a obtener. Máximo recomendado 100.
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
 *         description: Notificaciones obtenidas correctamente.
 *       400:
 *         description: Filtros inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 */
router.get("/my", notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marcar todas mis notificaciones como leídas
 *     description: Marca como leídas todas las notificaciones no leídas del usuario autenticado dentro del tenant actual.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas.
 *       401:
 *         description: Token requerido, inválido o expirado.
 */
router.patch("/read-all", notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     description: Marca como leída una notificación específica del usuario autenticado.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la notificación.
 *         schema:
 *           type: string
 *         example: cmq0t5n2h000hfo9wdafv11e9
 *     responses:
 *       200:
 *         description: Notificación marcada como leída.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       404:
 *         description: Notificación no encontrada.
 */
router.patch("/:id/read", notificationController.markAsRead);

export default router;