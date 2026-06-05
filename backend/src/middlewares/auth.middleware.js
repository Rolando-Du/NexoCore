import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
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

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token requerido",
      });
    }

    const payload = jwt.verify(token, env.jwtSecret);

    if (!payload?.sub || !payload?.tenantId) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    const membership = await prisma.tenantUser.findFirst({
      where: {
        userId: payload.sub,
        tenantId: payload.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                permission: {
                  select: {
                    key: true,
                  },
                },
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

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
};