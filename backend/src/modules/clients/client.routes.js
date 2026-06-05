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
 *     description: Obtiene los clientes del tenant actual. Permite incluir o excluir clientes inactivos.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         required: false
 *         description: Si es false, devuelve solo clientes activos. Si se omite, devuelve activos e inactivos.
 *         schema:
 *           type: boolean
 *         example: false
 *     responses:
 *       200:
 *         description: Clientes obtenidos correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar clientes.
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
 *     description: Crea un cliente dentro del tenant actual. Puede incluir ubicaciones y contactos iniciales.
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
 *                   required:
 *                     - name
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
 *                     lat:
 *                       type: number
 *                       example: -34.6037
 *                     lng:
 *                       type: number
 *                       example: -58.3816
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
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
 *         description: Cliente creado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para crear clientes.
 *       409:
 *         description: Ya existe un cliente con ese CUIT / Tax ID o email.
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
 *     description: Obtiene el detalle de un cliente específico del tenant actual.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente.
 *         schema:
 *           type: string
 *         example: cmq0fnnca0000zc9wk27knn2x
 *     responses:
 *       200:
 *         description: Cliente obtenido correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar el cliente.
 *       404:
 *         description: Cliente no encontrado.
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
 *     description: Actualiza los datos principales de un cliente del tenant actual.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente.
 *         schema:
 *           type: string
 *         example: cmq0fnnca0000zc9wk27knn2x
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
 *         description: Cliente actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para actualizar clientes.
 *       404:
 *         description: Cliente no encontrado.
 *       409:
 *         description: Ya existe un cliente con ese CUIT / Tax ID o email.
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
 *     description: Realiza una baja lógica del cliente. No borra el registro físicamente, solo lo marca como inactivo.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente.
 *         schema:
 *           type: string
 *         example: cmq0fnnca0000zc9wk27knn2x
 *     responses:
 *       200:
 *         description: Cliente deshabilitado correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para deshabilitar clientes.
 *       404:
 *         description: Cliente no encontrado.
 *       409:
 *         description: El cliente ya se encuentra inactivo.
 */
router.patch(
  "/:id/disable",
  requirePermission("clients:disable"),
  clientController.disableClient
);

export default router;