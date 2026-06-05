import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  clientId: "",
  type: "TASK",
  title: "",
  description: "",
  priority: "MEDIUM",
  scheduledAt: "",
};

const operationTypes = [
  { value: "TASK", label: "Tarea" },
  { value: "WORK_ORDER", label: "Orden de trabajo" },
  { value: "INCIDENT", label: "Incidente" },
  { value: "INSPECTION", label: "Inspección" },
  { value: "SERVICE_REQUEST", label: "Solicitud de servicio" },
];

const priorities = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
];

const statuses = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "PAUSED", label: "Pausada" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
];

const getStatusLabel = (status) => {
  const found = statuses.find((item) => item.value === status);
  return found?.label || status;
};

const getTypeLabel = (type) => {
  const found = operationTypes.find((item) => item.value === type);
  return found?.label || type;
};

const getPriorityLabel = (priority) => {
  const found = priorities.find((item) => item.value === priority);
  return found?.label || priority;
};

const statusClassName = {
  DRAFT: "bg-slate-500/10 text-slate-300",
  PENDING: "bg-yellow-500/10 text-yellow-300",
  IN_PROGRESS: "bg-cyan-500/10 text-cyan-300",
  PAUSED: "bg-orange-500/10 text-orange-300",
  COMPLETED: "bg-emerald-500/10 text-emerald-300",
  CANCELLED: "bg-red-500/10 text-red-300",
};

const priorityClassName = {
  LOW: "bg-slate-500/10 text-slate-300",
  MEDIUM: "bg-blue-500/10 text-blue-300",
  HIGH: "bg-orange-500/10 text-orange-300",
  CRITICAL: "bg-red-500/10 text-red-300",
};

const cleanPayload = (data) => {
  const payload = {
    ...data,
  };

  if (!payload.clientId) {
    delete payload.clientId;
  }

  if (!payload.description) {
    delete payload.description;
  }

  if (!payload.scheduledAt) {
    delete payload.scheduledAt;
  } else {
    payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
  }

  return payload;
};

const Operations = () => {
  const { userSession } = useAuth();

  const [operations, setOperations] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [statusChanges, setStatusChanges] = useState({});
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeClients = useMemo(() => {
    return clients.filter((client) => client.isActive);
  }, [clients]);

  const getOperations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/operations");

      setOperations(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudieron obtener las operaciones"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getClients = useCallback(async () => {
    try {
      const response = await api.get("/clients");

      setClients(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudieron obtener los clientes"
      );
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    await Promise.all([getClients(), getOperations()]);
  }, [getClients, getOperations]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleStatusSelect = (operationId, value) => {
    setStatusChanges((currentStatusChanges) => ({
      ...currentStatusChanges,
      [operationId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccessMessage("");

      const payload = cleanPayload({
        ...form,
        assignedToId: userSession?.user?.id,
      });

      await api.post("/operations", payload);

      setForm(initialForm);
      setSuccessMessage("Operación creada correctamente");
      await getOperations();
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo crear la operación");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (operation) => {
    const nextStatus = statusChanges[operation.id];

    if (!nextStatus) {
      setError("Seleccioná un estado para actualizar la operación");
      return;
    }

    try {
      setUpdatingStatusId(operation.id);
      setError("");
      setSuccessMessage("");

      await api.patch(`/operations/${operation.id}/status`, {
        status: nextStatus,
        note: `Cambio de estado desde el panel web a ${nextStatus}`,
      });

      setSuccessMessage("Estado actualizado correctamente");

      setStatusChanges((currentStatusChanges) => ({
        ...currentStatusChanges,
        [operation.id]: "",
      }));

      await getOperations();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudo actualizar el estado de la operación"
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadInitialData();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadInitialData]);

  return (
    <div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Operaciones</h2>
          <p className="mt-2 text-slate-400">
            Gestioná tareas, órdenes de trabajo, incidentes e inspecciones.
          </p>
        </div>

        <button
          type="button"
          onClick={getOperations}
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

      {successMessage && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
        >
          <h3 className="text-xl font-semibold">Nueva operación</h3>
          <p className="mt-1 text-sm text-slate-400">
            Creá una tarea, orden de trabajo o incidente.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-300">Cliente</label>
              <select
                name="clientId"
                value={form.clientId}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              >
                <option value="">Sin cliente asociado</option>
                {activeClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Tipo *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              >
                {operationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Título *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                placeholder="Verificar instalación eléctrica"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                placeholder="Detalle del trabajo a realizar..."
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Prioridad</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Fecha programada</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            disabled={creating}
            className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {creating ? "Creando..." : "Crear operación"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Listado</h3>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {operations.length} operaciones
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">Cargando operaciones...</p>
          ) : operations.length === 0 ? (
            <p className="mt-6 text-slate-400">
              Todavía no hay operaciones cargadas.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {operations.map((operation) => (
                <article
                  key={operation.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            statusClassName[operation.status] ||
                            "bg-slate-500/10 text-slate-300"
                          }`}
                        >
                          {getStatusLabel(operation.status)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            priorityClassName[operation.priority] ||
                            "bg-slate-500/10 text-slate-300"
                          }`}
                        >
                          {getPriorityLabel(operation.priority)}
                        </span>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {getTypeLabel(operation.type)}
                        </span>
                      </div>

                      <h4 className="mt-3 text-lg font-semibold text-slate-100">
                        {operation.title}
                      </h4>

                      <p className="mt-1 text-sm text-slate-400">
                        {operation.description || "Sin descripción"}
                      </p>

                      <div className="mt-4 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
                        <p>
                          Cliente:{" "}
                          <span className="text-slate-200">
                            {operation.client?.name || "Sin cliente"}
                          </span>
                        </p>

                        <p>
                          Programada:{" "}
                          <span className="text-slate-200">
                            {operation.scheduledAt
                              ? new Date(operation.scheduledAt).toLocaleString()
                              : "-"}
                          </span>
                        </p>

                        <p>
                          Inicio:{" "}
                          <span className="text-slate-200">
                            {operation.startedAt
                              ? new Date(operation.startedAt).toLocaleString()
                              : "-"}
                          </span>
                        </p>

                        <p>
                          Finalización:{" "}
                          <span className="text-slate-200">
                            {operation.completedAt
                              ? new Date(operation.completedAt).toLocaleString()
                              : "-"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="min-w-56">
                      <label className="text-xs text-slate-400">
                        Cambiar estado
                      </label>

                      <select
                        value={statusChanges[operation.id] || ""}
                        onChange={(event) =>
                          handleStatusSelect(operation.id, event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                      >
                        <option value="">Seleccionar...</option>
                        {statuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(operation)}
                        disabled={updatingStatusId === operation.id}
                        className="mt-3 w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-cyan-500 hover:text-slate-950 disabled:opacity-60"
                      >
                        {updatingStatusId === operation.id
                          ? "Actualizando..."
                          : "Actualizar estado"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Operations;