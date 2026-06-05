import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token requerido",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const membership = await prisma.tenantUser.findFirst({
      where: {
        userId: payload.sub,
        tenantId: payload.tenantId,
      },
      include: {
        user: true,
        tenant: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "El usuario no tiene acceso a esta empresa",
      });
    }

    if (membership.user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Usuario inactivo o bloqueado",
      });
    }

    if (!membership.tenant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Empresa inactiva",
      });
    }

    const permissions = membership.role.permissions.map(
      (rolePermission) => rolePermission.permission.key
    );

    req.context = {
      user: {
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
        status: membership.user.status,
      },
      tenant: {
        id: membership.tenant.id,
        name: membership.tenant.name,
      },
      role: {
        id: membership.role.id,
        name: membership.role.name,
      },
      permissions,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};