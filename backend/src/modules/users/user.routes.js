import { Router } from "express";

import * as userController from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  requireAnyPermission,
  requirePermission,
} from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/users/roles:
 *   get:
 *     summary: Listar roles disponibles del tenant
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles obtenidos correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar roles.
 */
router.get(
  "/roles",
  requireAnyPermission(["users:read", "users:create", "users:update"]),
  userController.getTenantRoles
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios del tenant
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuarios obtenidos correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar usuarios.
 */
router.get(
  "/",
  requirePermission("users:read"),
  userController.getUsers
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear usuario
 *     tags:
 *       - Users
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
 *               - email
 *               - password
 *               - roleId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Usuario Operativo
 *               email:
 *                 type: string
 *                 format: email
 *                 example: operativo@nexocore.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Usuario1234
 *               roleId:
 *                 type: string
 *                 example: cmq09d8iz00020s9wroleid
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para crear usuarios.
 *       409:
 *         description: Ya existe un usuario con ese email.
 */
router.post(
  "/",
  requirePermission("users:create"),
  userController.createUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para consultar usuarios.
 *       404:
 *         description: Usuario no encontrado.
 */
router.get(
  "/:id",
  requirePermission("users:read"),
  userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Usuario Operativo Actualizado
 *               roleId:
 *                 type: string
 *                 example: cmq09d8iz00020s9wroleid
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, BLOCKED]
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para actualizar usuarios.
 *       404:
 *         description: Usuario no encontrado.
 */
router.put(
  "/:id",
  requirePermission("users:update"),
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}/disable:
 *   patch:
 *     summary: Deshabilitar usuario
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario.
 *     responses:
 *       200:
 *         description: Usuario deshabilitado correctamente.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: No tiene permisos para deshabilitar usuarios.
 *       404:
 *         description: Usuario no encontrado.
 */
router.patch(
  "/:id/disable",
  requirePermission("users:disable"),
  userController.disableUser
);

export default router;
