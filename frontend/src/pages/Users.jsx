import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { usePermissions } from "../hooks/usePermissions";

const initialForm = {
  name: "",
  email: "",
  password: "",
  roleId: "",
};

const statusClassName = {
  ACTIVE: "bg-emerald-500/10 text-emerald-300",
  INACTIVE: "bg-slate-500/10 text-slate-300",
  BLOCKED: "bg-red-500/10 text-red-300",
};

const getStatusLabel = (status) => {
  if (status === "ACTIVE") return "Activo";
  if (status === "INACTIVE") return "Inactivo";
  if (status === "BLOCKED") return "Bloqueado";
  return status;
};

const Users = () => {
  const { can } = usePermissions();

  const canCreateUsers = can("users:create");
  const canUpdateUsers = can("users:update");
  const canDisableUsers = can("users:disable");

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      setError("");

      const response = await api.get("/users/roles");
      const data = response.data.data;

      setRoles(data);

      setForm((currentForm) => {
        if (currentForm.roleId || data.length === 0) return currentForm;

        return {
          ...currentForm,
          roleId: data[0].id,
        };
      });
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudieron obtener los roles"
      );
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudieron obtener los usuarios"
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

    if (!canCreateUsers) {
      setError("No tenés permisos para crear usuarios");
      return;
    }

    if (!form.name || !form.email || !form.password || !form.roleId) {
      setError("Completá nombre, email, contraseña y rol");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccessMessage("");

      await api.post("/users", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: form.roleId,
      });

      setForm({
        ...initialForm,
        roleId: roles[0]?.id || "",
      });

      setSuccessMessage("Usuario creado correctamente");
      await getUsers();
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo crear el usuario");
    } finally {
      setCreating(false);
    }
  };

  const handleUserUpdate = async ({ userId, name, roleId, status }) => {
    if (!canUpdateUsers) {
      setError("No tenés permisos para actualizar usuarios");
      return;
    }

    try {
      setUpdatingUserId(userId);
      setError("");
      setSuccessMessage("");

      await api.put(`/users/${userId}`, {
        name,
        roleId,
        status,
      });

      setSuccessMessage("Usuario actualizado correctamente");
      await getUsers();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo actualizar el usuario"
      );
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleDisableUser = async (userId) => {
    if (!canDisableUsers) {
      setError("No tenés permisos para deshabilitar usuarios");
      return;
    }

    try {
      setUpdatingUserId(userId);
      setError("");
      setSuccessMessage("");

      await api.patch(`/users/${userId}/disable`);

      setSuccessMessage("Usuario deshabilitado correctamente");
      await getUsers();
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo deshabilitar el usuario"
      );
    } finally {
      setUpdatingUserId("");
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      getRoles();
      getUsers();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [getRoles, getUsers]);

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold md:text-3xl">Usuarios</h2>
          <p className="mt-2 text-sm text-slate-400 md:text-base">
            Gestioná usuarios, roles y estados dentro de la empresa actual.
          </p>
        </div>

        <button
          type="button"
          onClick={getUsers}
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

      {!canCreateUsers && (
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
          Tu rol actual no tiene permiso para crear nuevos usuarios.
        </div>
      )}

      <div
        className={`mt-6 grid gap-6 ${
          canCreateUsers ? "xl:grid-cols-[420px_1fr]" : "xl:grid-cols-1"
        }`}
      >
        {canCreateUsers && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6"
          >
            <h3 className="text-lg font-semibold md:text-xl">Nuevo usuario</h3>

            <p className="mt-1 text-sm text-slate-400">
              Creá usuarios para operar dentro del tenant actual.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-slate-300">Nombre *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Usuario Operativo"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="operativo@nexocore.com"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Usuario1234"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                </p>
              </div>

              <div>
                <label className="text-sm text-slate-300">Rol *</label>
                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  disabled={loadingRoles || roles.length === 0}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-60"
                >
                  {roles.length === 0 ? (
                    <option value="">Sin roles disponibles</option>
                  ) : (
                    roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || roles.length === 0}
              className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creando..." : "Crear usuario"}
            </button>
          </form>
        )}

        <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold md:text-xl">Listado</h3>

            <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {users.length} usuarios
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="mt-6 text-slate-400">
              Todavía no hay usuarios cargados.
            </p>
          ) : (
            <>
              <div className="mt-6 hidden overflow-x-auto lg:block">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400">
                      <th className="py-3 pr-4">Usuario</th>
                      <th className="py-3 pr-4">Rol</th>
                      <th className="py-3 pr-4">Estado</th>
                      <th className="py-3 pr-4">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((membership) => (
                      <tr
                        key={membership.id}
                        className="border-b border-slate-800/70"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-medium text-slate-100">
                            {membership.user.name}
                          </p>
                          <p className="break-all text-xs text-slate-500">
                            {membership.user.email}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          <select
                            value={membership.role.id}
                            disabled={
                              !canUpdateUsers ||
                              updatingUserId === membership.user.id ||
                              loadingRoles
                            }
                            onChange={(event) =>
                              handleUserUpdate({
                                userId: membership.user.id,
                                name: membership.user.name,
                                roleId: event.target.value,
                                status: membership.user.status,
                              })
                            }
                            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-60"
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              statusClassName[membership.user.status] ||
                              "bg-slate-500/10 text-slate-300"
                            }`}
                          >
                            {getStatusLabel(membership.user.status)}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <select
                              value={membership.user.status}
                              disabled={
                                !canUpdateUsers ||
                                updatingUserId === membership.user.id
                              }
                              onChange={(event) =>
                                handleUserUpdate({
                                  userId: membership.user.id,
                                  name: membership.user.name,
                                  roleId: membership.role.id,
                                  status: event.target.value,
                                })
                              }
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-60"
                            >
                              <option value="ACTIVE">Activo</option>
                              <option value="INACTIVE">Inactivo</option>
                              <option value="BLOCKED">Bloqueado</option>
                            </select>

                            {canDisableUsers && (
                              <button
                                type="button"
                                disabled={
                                  updatingUserId === membership.user.id ||
                                  membership.user.status === "INACTIVE"
                                }
                                onClick={() =>
                                  handleDisableUser(membership.user.id)
                                }
                                className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Deshabilitar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid gap-4 lg:hidden">
                {users.map((membership) => (
                  <article
                    key={membership.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="wrap-break-word font-semibold text-slate-100">
                          {membership.user.name}
                        </h4>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          {membership.user.email}
                        </p>

                        <div className="mt-3">
                          <label className="text-xs text-slate-400">Rol</label>

                          <select
                            value={membership.role.id}
                            disabled={
                              !canUpdateUsers ||
                              updatingUserId === membership.user.id ||
                              loadingRoles
                            }
                            onChange={(event) =>
                              handleUserUpdate({
                                userId: membership.user.id,
                                name: membership.user.name,
                                roleId: event.target.value,
                                status: membership.user.status,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-60"
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs ${
                          statusClassName[membership.user.status] ||
                          "bg-slate-500/10 text-slate-300"
                        }`}
                      >
                        {getStatusLabel(membership.user.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <select
                        value={membership.user.status}
                        disabled={
                          !canUpdateUsers ||
                          updatingUserId === membership.user.id
                        }
                        onChange={(event) =>
                          handleUserUpdate({
                            userId: membership.user.id,
                            name: membership.user.name,
                            roleId: membership.role.id,
                            status: event.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-60"
                      >
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="BLOCKED">Bloqueado</option>
                      </select>

                      {canDisableUsers && (
                        <button
                          type="button"
                          disabled={
                            updatingUserId === membership.user.id ||
                            membership.user.status === "INACTIVE"
                          }
                          onClick={() => handleDisableUser(membership.user.id)}
                          className="w-full rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Deshabilitar
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Users;