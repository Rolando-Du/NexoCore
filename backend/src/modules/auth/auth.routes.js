import { Router } from "express";
import * as authController from "./auth.controller.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register-tenant:
 *   post:
 *     summary: Registrar empresa y usuario administrador
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - adminName
 *               - adminEmail
 *               - adminPassword
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: NexoCore Demo
 *               legalName:
 *                 type: string
 *                 example: NexoCore Demo S.A.
 *               taxId:
 *                 type: string
 *                 example: 30700111222
 *               adminName:
 *                 type: string
 *                 example: Rolando Admin
 *               adminEmail:
 *                 type: string
 *                 example: admin@nexocore.com
 *               adminPassword:
 *                 type: string
 *                 example: Admin1234
 *     responses:
 *       201:
 *         description: Empresa y usuario administrador creados correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El email ya está registrado
 */
router.post("/register-tenant", authController.registerTenant);

export default router;