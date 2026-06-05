import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";

const initialForm = {
  email: "",
  password: "",
};

const defaultTenantId = import.meta.env.VITE_DEFAULT_TENANT_ID;

const EyeIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.88 5.48A9.77 9.77 0 0 1 12 5.25C18 5.25 21.75 12 21.75 12a17.6 17.6 0 0 1-3.12 4.08"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.61 6.61C3.87 8.48 2.25 12 2.25 12S6 18.75 12 18.75c1.18 0 2.27-.26 3.25-.68"
    />
  </svg>
);

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

    if (!form.email || !form.password) {
      setError("Completá email y contraseña");
      return;
    }

    if (!defaultTenantId) {
      setError("Falta configurar VITE_DEFAULT_TENANT_ID en el frontend");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await login({
        email: form.email.trim(),
        password: form.password,
        tenantId: defaultTenantId,
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
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  title={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="flex items-center justify-center px-4 text-slate-400 transition hover:text-cyan-300"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
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
            <p className="font-medium text-slate-400">Acceso demo</p>
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