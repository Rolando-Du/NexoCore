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
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UNREAD, READ, ARCHIVED]
 *         example: UNREAD
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
 *         description: Notificaciones obtenidas correctamente
 */
router.get("/my", notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marcar todas mis notificaciones como leídas
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas
 */
router.patch("/read-all", notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la notificación
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 */
router.patch("/:id/read", notificationController.markAsRead);

export default router;