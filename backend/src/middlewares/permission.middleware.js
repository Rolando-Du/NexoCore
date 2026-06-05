export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    const permissions = req.context?.permissions || [];

    if (!permissions.includes(permissionKey)) {
      return res.status(403).json({
        success: false,
        message: "No tenés permisos para realizar esta acción",
      });
    }

    next();
  };
};