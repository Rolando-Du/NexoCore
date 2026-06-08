import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { usePermissions } from "../hooks/usePermissions";

const initialForm = {
  name: "",
  legalName: "",
  taxId: "",
  email: "",
  phone: "",
};

const cleanPayload = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== "")
  );
};

const Clients = () => {
  const { can } = usePermissions();

  const canCreateClients = can("clients:create");
  const canDisableClients = can("clients:disable");

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingClientId, setUpdatingClientId] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clients");

      setClients(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudieron obtener los clientes"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canCreateClients) {
      setError("No tenés permisos para crear clientes");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccessMessage("");

      await api.post("/clients", cleanPayload(form));

      setForm(initialForm);
      setSuccessMessage("Cliente creado correctamente");
      await getClients();
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo crear el cliente");
    } finally {
      setCreating(false);
    }
  };

  const handleDisableClient = async (clientId) => {
    if (!canDisableClients) {
      setError("No tenés permisos para deshabilitar clientes");
      return;
    }

    try {
      setUpdatingClientId(clientId);
      setError("");
      setSuccessMessage("");

      await api.patch(`/clients/${clientId}/disable`);

      setSuccessMessage("Cliente deshabilitado correctamente");
      await getClients();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo deshabilitar el cliente"
      );
    } finally {
      setUpdatingClientId("");
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      getClients();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [getClients]);

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Clientes</h2>
          <p className="mt-2 text-sm text-slate-400 md:text-base">
            Gestioná clientes asociados a la empresa actual.
          </p>
        </div>

        <button
          type="button"
          onClick={getClients}
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

      {successMessage && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      {!canCreateClients && (
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
          Tu rol actual no tiene permiso para crear nuevos clientes.
        </div>
      )}

      <div
        className={`mt-6 grid gap-6 ${
          canCreateClients ? "xl:grid-cols-[420px_1fr]" : "xl:grid-cols-1"
        }`}
      >
        {canCreateClients && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6"
          >
            <h3 className="text-lg font-semibold md:text-xl">Nuevo cliente</h3>
            <p className="mt-1 text-sm text-slate-400">
              Cargá los datos principales del cliente.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-slate-300">Nombre *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  placeholder="Cliente Demo"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Razón social</label>
                <input
                  name="legalName"
                  value={form.legalName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  placeholder="Cliente Demo S.A."
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">CUIT / Tax ID</label>
                <input
                  name="taxId"
                  value={form.taxId}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  placeholder="30111222333"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  placeholder="contacto@cliente.com"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Teléfono</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  placeholder="+54 11 5555-5555"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creando..." : "Crear cliente"}
            </button>
          </form>
        )}

        <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold md:text-xl">Listado</h3>
            <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {clients.length} clientes
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">Cargando clientes...</p>
          ) : clients.length === 0 ? (
            <p className="mt-6 text-slate-400">
              Todavía no hay clientes cargados.
            </p>
          ) : (
            <>
              <div className="mt-6 space-y-4 md:hidden">
                {clients.map((client) => (
                  <article
                    key={client.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-slate-100">
                          {client.name}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          {client.taxId || "Sin CUIT"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                          client.isActive
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-red-500/10 text-red-300"
                        }`}
                      >
                        {client.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-slate-400">
                        Email:{" "}
                        <span className="break-all text-slate-200">
                          {client.email || "-"}
                        </span>
                      </p>

                      <p className="text-slate-400">
                        Teléfono:{" "}
                        <span className="text-slate-200">
                          {client.phone || "-"}
                        </span>
                      </p>

                      {client.legalName && (
                        <p className="text-slate-400">
                          Razón social:{" "}
                          <span className="text-slate-200">
                            {client.legalName}
                          </span>
                        </p>
                      )}
                    </div>

                    {canDisableClients && (
                      <button
                        type="button"
                        disabled={
                          updatingClientId === client.id || !client.isActive
                        }
                        onClick={() => handleDisableClient(client.id)}
                        className="mt-4 w-full rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Deshabilitar
                      </button>
                    )}
                  </article>
                ))}
              </div>

              <div className="mt-6 hidden overflow-x-auto md:block">
                <table className="w-full min-w-180 border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400">
                      <th className="py-3 pr-4">Nombre</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Teléfono</th>
                      <th className="py-3 pr-4">Estado</th>
                      {canDisableClients && (
                        <th className="py-3 pr-4">Acciones</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {clients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-slate-800/70"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-medium text-slate-100">
                            {client.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {client.taxId || "Sin CUIT"}
                          </p>
                        </td>

                        <td className="py-4 pr-4 text-slate-300">
                          {client.email || "-"}
                        </td>

                        <td className="py-4 pr-4 text-slate-300">
                          {client.phone || "-"}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              client.isActive
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-red-500/10 text-red-300"
                            }`}
                          >
                            {client.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {canDisableClients && (
                          <td className="py-4 pr-4">
                            <button
                              type="button"
                              disabled={
                                updatingClientId === client.id ||
                                !client.isActive
                              }
                              onClick={() => handleDisableClient(client.id)}
                              className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Deshabilitar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;

