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
 *     description: Permite subir una imagen, PDF, Word o Excel como evidencia asociada a una operación.
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operationId
 *         required: true
 *         description: ID de la operación a la que se asociará la evidencia.
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
 *                 description: Archivo permitido. Imágenes, PDF, Word o Excel.
 *               description:
 *                 type: string
 *                 description: Descripción opcional de la evidencia.
 *                 example: Foto del tablero antes de iniciar el trabajo.
 *     responses:
 *       201:
 *         description: Evidencia subida correctamente.
 *       400:
 *         description: Archivo requerido, archivo no permitido o datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para subir evidencias.
 *       404:
 *         description: Operación no encontrada.
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
 *     description: Obtiene todas las evidencias asociadas a una operación del tenant actual.
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: operationId
 *         required: true
 *         description: ID de la operación.
 *         schema:
 *           type: string
 *         example: cmq0t1glp0007fo9w0je06l0j
 *     responses:
 *       200:
 *         description: Evidencias obtenidas correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar evidencias.
 *       404:
 *         description: Operación no encontrada.
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
 *     summary: Obtener evidencia por ID
 *     description: Obtiene el detalle de una evidencia específica perteneciente al tenant actual.
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la evidencia.
 *         schema:
 *           type: string
 *         example: cmq12sb9j00014c9wromxb76k
 *     responses:
 *       200:
 *         description: Archivo obtenido correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar la evidencia.
 *       404:
 *         description: Archivo no encontrado.
 */
router.get(
  "/:id",
  requirePermission("operations:read"),
  attachmentController.getAttachmentById
);

export default router;