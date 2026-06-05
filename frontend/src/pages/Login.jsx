import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "admin@nexocore.com",
    password: "Admin1234",
    tenantId: "cmq09d8i700000s9w9st4nlb4",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      await login(form);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-cyan-400">NexoCore</h1>
        <p className="mt-2 text-slate-400">
          Ingresá al panel administrativo
        </p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Tenant ID</label>
            <input
              name="tenantId"
              value={form.tenantId}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;