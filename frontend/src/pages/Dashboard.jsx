import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const statusLabels = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  PAUSED: "Pausada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const statusClassName = {
  DRAFT: "bg-slate-500/10 text-slate-300",
  PENDING: "bg-yellow-500/10 text-yellow-300",
  IN_PROGRESS: "bg-cyan-500/10 text-cyan-300",
  PAUSED: "bg-orange-500/10 text-orange-300",
  COMPLETED: "bg-emerald-500/10 text-emerald-300",
  CANCELLED: "bg-red-500/10 text-red-300",
};

const statCards = [
  {
    key: "totalClients",
    label: "Clientes",
    className: "border-slate-800 bg-slate-900/70 text-slate-100",
    labelClassName: "text-slate-400",
  },
  {
    key: "totalOperations",
    label: "Operaciones",
    className: "border-slate-800 bg-slate-900/70 text-slate-100",
    labelClassName: "text-slate-400",
  },
  {
    key: "pending",
    label: "Pendientes",
    className: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
    labelClassName: "text-yellow-200",
  },
  {
    key: "inProgress",
    label: "En progreso",
    className: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
    labelClassName: "text-cyan-200",
  },
  {
    key: "completed",
    label: "Completadas",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    labelClassName: "text-emerald-200",
  },
  {
    key: "unreadNotifications",
    label: "No leídas",
    className: "border-purple-500/20 bg-purple-500/10 text-purple-300",
    labelClassName: "text-purple-200",
  },
];

const Dashboard = () => {
  const { userSession } = useAuth();

  const [clients, setClients] = useState([]);
  const [operations, setOperations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const pending = operations.filter(
      (operation) => operation.status === "PENDING"
    ).length;

    const inProgress = operations.filter(
      (operation) => operation.status === "IN_PROGRESS"
    ).length;

    const completed = operations.filter(
      (operation) => operation.status === "COMPLETED"
    ).length;

    const unreadNotifications = notifications.filter(
      (notification) => notification.status === "UNREAD"
    ).length;

    return {
      totalClients: clients.length,
      totalOperations: operations.length,
      pending,
      inProgress,
      completed,
      unreadNotifications,
    };
  }, [clients, operations, notifications]);

  const latestOperations = useMemo(() => {
    return operations.slice(0, 5);
  }, [operations]);

  const latestNotifications = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [clientsResponse, operationsResponse, notificationsResponse] =
        await Promise.all([
          api.get("/clients"),
          api.get("/operations"),
          api.get("/notifications/my", {
            params: {
              take: 50,
              skip: 0,
            },
          }),
        ]);

      setClients(clientsResponse.data.data);
      setOperations(operationsResponse.data.data);
      setNotifications(notificationsResponse.data.data.notifications);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los datos del dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadDashboard]);

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold md:text-3xl">Dashboard</h2>
          <p className="mt-2 wrap-break-word text-sm text-slate-400 md:text-base">
            Bienvenido a NexoCore, {userSession?.user?.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-cyan-400 md:w-auto"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-slate-400">Cargando dashboard...</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {statCards.map((card) => (
              <article
                key={card.key}
                className={`rounded-2xl border p-4 md:p-6 ${card.className}`}
              >
                <p className={`text-sm ${card.labelClassName}`}>
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold">{stats[card.key]}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold md:text-xl">
                  Últimas operaciones
                </h3>

                <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {latestOperations.length}
                </span>
              </div>

              {latestOperations.length === 0 ? (
                <p className="mt-6 text-slate-400">
                  Todavía no hay operaciones cargadas.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {latestOperations.map((operation) => (
                    <article
                      key={operation.id}
                      className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="wrap-break-word font-semibold text-slate-100">
                            {operation.title}
                          </h4>

                          <p className="mt-1 wrap-break-word text-sm text-slate-400">
                            {operation.client?.name || "Sin cliente"}
                          </p>
                        </div>

                        <span
                          className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs ${
                            statusClassName[operation.status] ||
                            "bg-slate-500/10 text-slate-300"
                          }`}
                        >
                          {statusLabels[operation.status] || operation.status}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Creada:{" "}
                        <span className="text-slate-400">
                          {new Date(operation.createdAt).toLocaleString()}
                        </span>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold md:text-xl">
                  Últimas notificaciones
                </h3>

                <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {latestNotifications.length}
                </span>
              </div>

              {latestNotifications.length === 0 ? (
                <p className="mt-6 text-slate-400">
                  Todavía no hay notificaciones.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {latestNotifications.map((notification) => (
                    <article
                      key={notification.id}
                      className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="wrap-break-word font-semibold text-slate-100">
                            {notification.title}
                          </h4>

                          <p className="mt-1 wrap-break-word text-sm text-slate-400">
                            {notification.message}
                          </p>
                        </div>

                        <span
                          className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs ${
                            notification.status === "UNREAD"
                              ? "bg-cyan-500/10 text-cyan-300"
                              : "bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          {notification.status === "UNREAD"
                            ? "No leída"
                            : "Leída"}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Fecha:{" "}
                        <span className="text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;