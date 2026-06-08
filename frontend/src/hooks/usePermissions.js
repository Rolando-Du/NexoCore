import { useMemo } from "react";
import { useAuth } from "./useAuth";

const normalizePermissions = (permissions = []) => {
  return permissions
    .map((permission) => {
      if (typeof permission === "string") return permission;
      return permission?.key;
    })
    .filter(Boolean);
};

export const usePermissions = () => {
  const { userSession } = useAuth();

  const permissions = useMemo(() => {
    return normalizePermissions(userSession?.permissions);
  }, [userSession?.permissions]);

  const roleName = userSession?.role?.name || "";
  const isTenantAdmin = roleName === "TENANT_ADMIN";

  const can = (permission) => {
    if (isTenantAdmin) return true;
    return permissions.includes(permission);
  };

  const canAny = (permissionList = []) => {
    if (isTenantAdmin) return true;
    return permissionList.some((permission) =>
      permissions.includes(permission)
    );
  };

  const canAll = (permissionList = []) => {
    if (isTenantAdmin) return true;
    return permissionList.every((permission) =>
      permissions.includes(permission)
    );
  };

  return {
    permissions,
    roleName,
    isTenantAdmin,
    can,
    canAny,
    canAll,
  };
};