import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.replace("Bearer ", "").trim();
};

const normalizePermissions = (rolePermissions = []) => {
  return rolePermissions
    .map((rolePermission) => rolePermission.permission?.key)
    .filter(Boolean);
};

export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

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

    if (!membership.user) {
      return res.status(403).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (membership.user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Usuario inactivo o bloqueado",
      });
    }

    if (!membership.tenant?.isActive) {
      return res.status(403).json({
        success: false,
        message: "Empresa inactiva",
      });
    }

    if (!membership.role) {
      return res.status(403).json({
        success: false,
        message: "El usuario no tiene un rol asignado",
      });
    }

    const permissions = normalizePermissions(membership.role.permissions);

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

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    return next(error);
  }
};

