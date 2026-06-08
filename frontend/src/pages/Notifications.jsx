import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const statusOptions = [
  { value: "", label: "Todas" },
  { value: "UNREAD", label: "No leídas" },
  { value: "READ", label: "Leídas" },
  { value: "ARCHIVED", label: "Archivadas" },
];

const typeOptions = [
  { value: "", label: "Todos" },
  { value: "OPERATION_ASSIGNED", label: "Operación asignada" },
  { value: "OPERATION_STATUS_CHANGED", label: "Cambio de estado" },
];

const typeLabels = {
  OPERATION_ASSIGNED: "Operación asignada",
  OPERATION_STATUS_CHANGED: "Cambio de estado",
};

const statusClassName = {
  UNREAD: "bg-cyan-500/10 text-cyan-300",
  READ: "bg-emerald-500/10 text-emerald-300",
  ARCHIVED: "bg-slate-500/10 text-slate-300",
};

const getTypeLabel = (type) => {
  return typeLabels[type] || type;
};

const getStatusLabel = (status) => {
  if (status === "UNREAD") return "No leída";
  if (status === "READ") return "Leída";
  if (status === "ARCHIVED") return "Archivada";
  return status;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);

  const [filters, setFilters] = useState({
    status: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const visibleUnreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => notification.status === "UNREAD"
    ).length;
  }, [notifications]);

  const hasActiveFilters = Boolean(filters.status || filters.type);

  const getNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        take: 50,
        skip: 0,
      };

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.type) {
        params.type = filters.type;
      }

      const response = await api.get("/notifications/my", { params });
      const data = response.data.data;

      setNotifications(data.notifications || []);
      setUnreadTotal(data.unreadTotal ?? 0);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudieron obtener las notificaciones"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });

    setError("");
    setSuccessMessage("");
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      type: "",
    });

    setError("");
    setSuccessMessage("");
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingId(notificationId);
      setError("");
      setSuccessMessage("");

      await api.patch(`/notifications/${notificationId}/read`);

      setSuccessMessage("Notificación marcada como leída");
      await getNotifications();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo marcar la notificación como leída"
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");
      setSuccessMessage("");

      const response = await api.patch("/notifications/read-all");

      setSuccessMessage(
        `Notificaciones marcadas como leídas: ${response.data.data.updated}`
      );

      await getNotifications();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudieron marcar las notificaciones como leídas"
      );
    } finally {
      setMarkingAll(false);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      getNotifications();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [getNotifications]);

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold md:text-3xl">Notificaciones</h2>
          <p className="mt-2 text-sm text-slate-400 md:text-base">
            Consultá eventos importantes sobre operaciones, asignaciones y
            cambios de estado.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <button
            type="button"
            onClick={getNotifications}
            disabled={loading}
            className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadTotal === 0}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {markingAll ? "Marcando..." : "Marcar todas como leídas"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
          <h3 className="text-lg font-semibold md:text-xl">Filtros</h3>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label className="text-sm text-slate-300">Estado</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              >
                {statusOptions.map((status) => (
                  <option key={status.label} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Tipo</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              >
                {typeOptions.map((type) => (
                  <option key={type.label} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:border-cyan-400 hover:text-cyan-400"
              >
                Limpiar filtros
              </button>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">No leídas totales</p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">
                {unreadTotal}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">No leídas visibles</p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">
                {visibleUnreadCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Mostradas</p>
              <p className="mt-2 text-3xl font-bold text-slate-100">
                {notifications.length}
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold md:text-xl">Listado</h3>
            <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {notifications.length} notificaciones
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">Cargando notificaciones...</p>
          ) : notifications.length === 0 ? (
            <p className="mt-6 text-slate-400">
              No hay notificaciones para mostrar.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            statusClassName[notification.status] ||
                            "bg-slate-500/10 text-slate-300"
                          }`}
                        >
                          {getStatusLabel(notification.status)}
                        </span>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {getTypeLabel(notification.type)}
                        </span>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {notification.channel}
                        </span>
                      </div>

                      <h4 className="mt-3 wrap-break-word text-base font-semibold text-slate-100 md:text-lg">
                        {notification.title}
                      </h4>

                      <p className="mt-1 wrap-break-word text-sm text-slate-400">
                        {notification.message}
                      </p>

                      <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                        <p>
                          Fecha:{" "}
                          <span className="text-slate-300">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </p>

                        <p>
                          Estado:{" "}
                          <span className="text-slate-300">
                            {getStatusLabel(notification.status)}
                          </span>
                        </p>

                        {notification.payload?.operationId && (
                          <p className="break-all sm:col-span-2">
                            Operación:{" "}
                            <span className="text-slate-300">
                              {notification.payload.operationId}
                            </span>
                          </p>
                        )}

                        {notification.readAt && (
                          <p className="sm:col-span-2">
                            Leída el:{" "}
                            <span className="text-slate-300">
                              {new Date(notification.readAt).toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="w-full xl:w-52 xl:shrink-0">
                      {notification.status === "UNREAD" ? (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markingId === notification.id}
                          className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-cyan-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {markingId === notification.id
                            ? "Marcando..."
                            : "Marcar como leída"}
                        </button>
                      ) : (
                        <div className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-300">
                          {getStatusLabel(notification.status)}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Notifications;
