import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";

const initialForm = {
  email: "",
  password: "",
  tenantId: "",
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password || !form.tenantId) {
      setError("Completá email, contraseña y Tenant ID");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await login({
        email: form.email.trim(),
        password: form.password,
        tenantId: form.tenantId.trim(),
      });

      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur md:p-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Enterprise SaaS
            </p>

            <h1 className="mt-3 text-3xl font-bold text-cyan-400 md:text-4xl">
              NexoCore
            </h1>

            <p className="mt-2 text-sm text-slate-400 md:text-base">
              Ingresá al panel administrativo.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="admin@nexocore.com"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Contraseña</label>

              <div className="mt-1 flex rounded-lg border border-slate-700 bg-slate-950 focus-within:border-cyan-400">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Ingresá tu contraseña"
                  className="w-full rounded-lg bg-transparent px-4 py-3 text-slate-100 outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="px-4 text-sm text-slate-400 hover:text-cyan-300"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Tenant ID</label>
              <input
                name="tenantId"
                value={form.tenantId}
                onChange={handleChange}
                autoComplete="off"
                placeholder="ID de la empresa"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-500">
            <p className="font-medium text-slate-400">Datos de prueba</p>
            <p className="mt-2 wrap-break-word">
              Usá el usuario administrador creado desde el backend.
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;