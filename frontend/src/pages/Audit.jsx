import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

const actionOptions = [
  { value: "", label: "Todas" },
  { value: "CREATE", label: "Crear" },
  { value: "UPDATE", label: "Actualizar" },
  { value: "DELETE", label: "Eliminar" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "READ", label: "Lectura" },
  { value: "ASSIGN", label: "Asignación" },
  { value: "STATUS_CHANGE", label: "Cambio de estado" },
];

const moduleOptions = [
  { value: "", label: "Todos" },
  { value: "auth", label: "Auth" },
  { value: "clients", label: "Clientes" },
  { value: "operations", label: "Operaciones" },
  { value: "attachments", label: "Evidencias" },
];

const actionClassName = {
  CREATE: "bg-emerald-500/10 text-emerald-300",
  UPDATE: "bg-cyan-500/10 text-cyan-300",
  DELETE: "bg-red-500/10 text-red-300",
  LOGIN: "bg-purple-500/10 text-purple-300",
  LOGOUT: "bg-slate-500/10 text-slate-300",
  READ: "bg-blue-500/10 text-blue-300",
  ASSIGN: "bg-orange-500/10 text-orange-300",
  STATUS_CHANGE: "bg-yellow-500/10 text-yellow-300",
};

const formatJson = (value) => {
  if (!value) return "-";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    module: "",
    action: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const getAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        take: 50,
        skip: 0,
      };

      if (filters.module) {
        params.module = filters.module;
      }

      if (filters.action) {
        params.action = filters.action;
      }

      const response = await api.get("/audit", { params });

      setLogs(response.data.data.logs);
      setTotal(response.data.data.total);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudieron obtener los registros de auditoría"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const getAuditDetail = async (auditId) => {
    try {
      setSelectedLog(null);
      setIsDetailModalOpen(true);
      setLoadingDetail(true);
      setError("");

      const response = await api.get(`/audit/${auditId}`);

      setSelectedLog(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo obtener el detalle de auditoría"
      );
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLog(null);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      getAuditLogs();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [getAuditLogs]);

  return (
    <div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Auditoría</h2>
          <p className="mt-2 text-slate-400">
            Consultá acciones realizadas dentro del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={getAuditLogs}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-cyan-400"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold">Filtros</h3>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-slate-300">Módulo</label>
                <select
                  name="module"
                  value={filters.module}
                  onChange={handleFilterChange}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                >
                  {moduleOptions.map((module) => (
                    <option key={module.label} value={module.value}>
                      {module.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300">Acción</label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                >
                  {actionOptions.map((action) => (
                    <option key={action.label} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={getAuditLogs}
              className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Aplicar filtros
            </button>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">Registros encontrados</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">{total}</p>
          </section>
        </aside>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Registros</h3>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {logs.length} visibles
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">Cargando auditoría...</p>
          ) : logs.length === 0 ? (
            <p className="mt-6 text-slate-400">
              No hay registros para mostrar.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {logs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            actionClassName[log.action] ||
                            "bg-slate-500/10 text-slate-300"
                          }`}
                        >
                          {log.action}
                        </span>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {log.module}
                        </span>

                        {log.entity && (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                            {log.entity}
                          </span>
                        )}
                      </div>

                      <h4 className="mt-3 font-semibold text-slate-100">
                        {log.metadata?.event || "Evento del sistema"}
                      </h4>

                      <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
                        <p>
                          Usuario:{" "}
                          <span className="text-slate-300">
                            {log.user?.name || "Sistema"}
                          </span>
                        </p>

                        <p>
                          Email:{" "}
                          <span className="text-slate-300">
                            {log.user?.email || "-"}
                          </span>
                        </p>

                        <p>
                          Fecha:{" "}
                          <span className="text-slate-300">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </p>

                        <p>
                          IP:{" "}
                          <span className="text-slate-300">
                            {log.ip || "-"}
                          </span>
                        </p>

                        {log.entityId && (
                          <p className="md:col-span-2">
                            Entity ID:{" "}
                            <span className="text-slate-300">
                              {log.entityId}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => getAuditDetail(log.id)}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-cyan-500 hover:text-slate-950"
                    >
                      Ver detalle
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {isDetailModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
          onClick={closeDetailModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-900 px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">
                  Detalle de auditoría
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {selectedLog?.id
                    ? `ID: ${selectedLog.id}`
                    : "Cargando detalle..."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-red-400 hover:text-red-300"
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">
              {loadingDetail ? (
                <p className="text-slate-400">Cargando detalle...</p>
              ) : selectedLog ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-400">Acción</p>
                      <p className="mt-1 font-semibold text-slate-100">
                        {selectedLog.action}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-400">Módulo</p>
                      <p className="mt-1 font-semibold text-slate-100">
                        {selectedLog.module}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-400">Usuario</p>
                      <p className="mt-1 font-semibold text-slate-100">
                        {selectedLog.user?.name || "Sistema"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-400">Fecha</p>
                      <p className="mt-1 font-semibold text-slate-100">
                        {new Date(selectedLog.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                      <h4 className="font-semibold text-slate-100">
                        Valor anterior
                      </h4>

                      <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
                        {formatJson(selectedLog.oldValue)}
                      </pre>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                      <h4 className="font-semibold text-slate-100">
                        Valor nuevo
                      </h4>

                      <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
                        {formatJson(selectedLog.newValue)}
                      </pre>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 lg:col-span-2">
                      <h4 className="font-semibold text-slate-100">
                        Metadata
                      </h4>

                      <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
                        {formatJson(selectedLog.metadata)}
                      </pre>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 lg:col-span-2">
                      <h4 className="font-semibold text-slate-100">
                        Información técnica
                      </h4>

                      <div className="mt-4 grid gap-3 text-sm text-slate-400 md:grid-cols-2">
                        <p>
                          Entidad:{" "}
                          <span className="text-slate-200">
                            {selectedLog.entity || "-"}
                          </span>
                        </p>

                        <p>
                          Entity ID:{" "}
                          <span className="text-slate-200">
                            {selectedLog.entityId || "-"}
                          </span>
                        </p>

                        <p>
                          IP:{" "}
                          <span className="text-slate-200">
                            {selectedLog.ip || "-"}
                          </span>
                        </p>

                        <p>
                          Email:{" "}
                          <span className="text-slate-200">
                            {selectedLog.user?.email || "-"}
                          </span>
                        </p>

                        <p className="md:col-span-2">
                          User Agent:{" "}
                          <span className="text-slate-200">
                            {selectedLog.userAgent || "-"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-400">No se encontró el detalle.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
