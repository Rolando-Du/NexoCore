import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { userSession } = useAuth();

  return (
    <div>
      <h2 className="text-3xl font-bold">Dashboard</h2>
      <p className="mt-2 text-slate-400">
        Bienvenido a NexoCore, {userSession?.user?.name}.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Empresa</p>
          <p className="mt-2 text-xl font-semibold">
            {userSession?.tenant?.name}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Rol</p>
          <p className="mt-2 text-xl font-semibold">
            {userSession?.role?.name}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm text-slate-400">Permisos</p>
          <p className="mt-2 text-xl font-semibold">
            {userSession?.permissions?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;