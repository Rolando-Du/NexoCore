const normalizePermissions = (permissions = []) => {
  return permissions
    .map((permission) => {
      if (typeof permission === "string") return permission;
      return permission?.key;
    })
    .filter(Boolean);
};

const getContextPermissions = (req) => {
  return normalizePermissions(req.context?.permissions);
};

const hasPermission = (req, permissionKey) => {
  const permissions = getContextPermissions(req);

  return permissions.includes(permissionKey);
};

export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.context) {
      return res.status(401).json({
        success: false,
        message: "Contexto de autenticación no encontrado",
      });
    }

    if (!hasPermission(req, permissionKey)) {
      return res.status(403).json({
        success: false,
        message: "No tenés permisos para realizar esta acción",
        requiredPermission: permissionKey,
      });
    }

    return next();
  };
};

export const requireAnyPermission = (permissionKeys = []) => {
  return (req, res, next) => {
    if (!req.context) {
      return res.status(401).json({
        success: false,
        message: "Contexto de autenticación no encontrado",
      });
    }

    const hasAnyPermission = permissionKeys.some((permissionKey) =>
      hasPermission(req, permissionKey)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        success: false,
        message: "No tenés permisos suficientes para realizar esta acción",
        requiredPermissions: permissionKeys,
      });
    }

    return next();
  };
};

export const requireAllPermissions = (permissionKeys = []) => {
  return (req, res, next) => {
    if (!req.context) {
      return res.status(401).json({
        success: false,
        message: "Contexto de autenticación no encontrado",
      });
    }

    const hasAllPermissions = permissionKeys.every((permissionKey) =>
      hasPermission(req, permissionKey)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message:
          "No tenés todos los permisos necesarios para realizar esta acción",
        requiredPermissions: permissionKeys,
      });
    }

    return next();
  };
};

export const canAccess = {
  permission: hasPermission,
  any: (req, permissionKeys = []) => {
    return permissionKeys.some((permissionKey) =>
      hasPermission(req, permissionKey)
    );
  },
  all: (req, permissionKeys = []) => {
    return permissionKeys.every((permissionKey) =>
      hasPermission(req, permissionKey)
    );
  },
};
