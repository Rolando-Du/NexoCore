import { Router } from "express";

import * as clientController from "./client.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Listar clientes
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clientes obtenidos correctamente
 */
router.get(
  "/",
  requirePermission("clients:read"),
  clientController.getClients
);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crear cliente
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cliente Demo
 *               legalName:
 *                 type: string
 *                 example: Cliente Demo S.A.
 *               taxId:
 *                 type: string
 *                 example: 30111222333
 *               email:
 *                 type: string
 *                 example: contacto@clientedemo.com
 *               phone:
 *                 type: string
 *                 example: "+54 11 5555-5555"
 *               locations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Casa Central
 *                     address:
 *                       type: string
 *                       example: Av. Principal 123
 *                     city:
 *                       type: string
 *                       example: Buenos Aires
 *                     state:
 *                       type: string
 *                       example: Buenos Aires
 *                     country:
 *                       type: string
 *                       example: Argentina
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Juan Pérez
 *                     email:
 *                       type: string
 *                       example: juan@clientedemo.com
 *                     phone:
 *                       type: string
 *                       example: "+54 11 4444-4444"
 *                     role:
 *                       type: string
 *                       example: Responsable operativo
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 */
router.post(
  "/",
  requirePermission("clients:create"),
  clientController.createClient
);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *         example: cmq0ducze0001zg9wkloe1xqg
 *     responses:
 *       200:
 *         description: Cliente obtenido correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.get(
  "/:id",
  requirePermission("clients:read"),
  clientController.getClientById
);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *         example: cmq0ducze0001zg9wkloe1xqg
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cliente Demo Actualizado
 *               legalName:
 *                 type: string
 *                 example: Cliente Demo Actualizado S.A.
 *               taxId:
 *                 type: string
 *                 example: 30111222333
 *               email:
 *                 type: string
 *                 example: nuevo@clientedemo.com
 *               phone:
 *                 type: string
 *                 example: "+54 11 6666-6666"
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.put(
  "/:id",
  requirePermission("clients:update"),
  clientController.updateClient
);

/**
 * @swagger
 * /api/clients/{id}/disable:
 *   patch:
 *     summary: Deshabilitar cliente
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *         example: cmq0ducze0001zg9wkloe1xqg
 *     responses:
 *       200:
 *         description: Cliente deshabilitado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.patch(
  "/:id/disable",
  requirePermission("clients:disable"),
  clientController.disableClient
);

export default router;