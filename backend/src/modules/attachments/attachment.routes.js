import { Router } from "express";

import * as attachmentController from "./attachment.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { uploadEvidence } from "../../middlewares/upload.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/attachments/operations/{operationId}:
 *   post:
 *     summary: Subir evidencia a una operación
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operationId
 *         required: true
 *         description: ID de la operación
 *         schema:
 *           type: string
 *         example: cmq0t1glp0007fo9w0je06l0j
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *                 example: Foto del tablero antes de iniciar el trabajo.
 *     responses:
 *       201:
 *         description: Evidencia subida correctamente
 */
router.post(
  "/operations/:operationId",
  requirePermission("operations:update"),
  uploadEvidence.single("file"),
  attachmentController.uploadOperationAttachment
);

/**
 * @swagger
 * /api/attachments/operations/{operationId}:
 *   get:
 *     summary: Listar evidencias de una operación
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operationId
 *         required: true
 *         description: ID de la operación
 *         schema:
 *           type: string
 *         example: cmq0t1glp0007fo9w0je06l0j
 *     responses:
 *       200:
 *         description: Evidencias obtenidas correctamente
 */
router.get(
  "/operations/:operationId",
  requirePermission("operations:read"),
  attachmentController.getOperationAttachments
);

/**
 * @swagger
 * /api/attachments/{id}:
 *   get:
 *     summary: Obtener archivo por ID
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del archivo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo obtenido correctamente
 */
router.get(
  "/:id",
  requirePermission("operations:read"),
  attachmentController.getAttachmentById
);

export default router;