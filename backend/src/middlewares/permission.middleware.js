export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    const permissions = req.context?.permissions;

    if (!permissions) {
      return res.status(401).json({
        success: false,
        message: "Contexto de autenticación no encontrado",
      });
    }

    if (!permissions.includes(permissionKey)) {
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
    const permissions = req.context?.permissions;

    if (!permissions) {
      return res.status(401).json({
        success: false,
        message: "Contexto de autenticación no encontrado",
      });
    }

    const hasPermission = permissionKeys.some((permissionKey) =>
      permissions.includes(permissionKey)
    );

    if (!hasPermission) {
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
    const permissions = req.context?.permissions;

    if (!permissions) {
      return res.status(401).json({
        success: false,
        message: "Contexto de autenticación no encontrado",
      });
    }

    const hasAllPermissions = permissionKeys.every((permissionKey) =>
      permissions.includes(permissionKey)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: "No tenés todos los permisos necesarios para realizar esta acción",
        requiredPermissions: permissionKeys,
      });
    }

    return next();
  };
};