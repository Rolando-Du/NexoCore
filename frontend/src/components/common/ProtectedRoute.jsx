import { Link, Navigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

const ProtectedRoute = ({ children, permissions = [] }) => {
  const { isAuthenticated, loading } = useAuth();
  const { canAny } = usePermissions();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Cargando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredPermission =
    permissions.length === 0 || canAny(permissions);

  if (!hasRequiredPermission) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-300">
            Acceso denegado
          </p>

          <h2 className="mt-3 text-2xl font-bold text-slate-100">
            No tenés permisos para ver esta sección
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            Tu rol actual no cuenta con los permisos necesarios para acceder a
            esta pantalla.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;