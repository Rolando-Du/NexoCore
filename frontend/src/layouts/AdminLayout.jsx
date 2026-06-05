import { Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { userSession, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/70 p-6 hidden md:block">
        <h1 className="text-2xl font-bold text-cyan-400">NexoCore</h1>
        <p className="text-xs text-slate-400 mt-1">Enterprise SaaS</p>

        <nav className="mt-8 space-y-3 text-sm">
          <a className="block text-slate-200 hover:text-cyan-400" href="/">
            Dashboard
          </a>
          <a className="block text-slate-200 hover:text-cyan-400" href="/clients">
            Clientes
          </a>
          <a className="block text-slate-200 hover:text-cyan-400" href="/operations">
            Operaciones
          </a>
          <a className="block text-slate-200 hover:text-cyan-400" href="/notifications">
            Notificaciones
          </a>
        </nav>
      </aside>

      <section className="flex-1">
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between px-6">
          <div>
            <p className="text-sm text-slate-400">Empresa</p>
            <p className="font-semibold">{userSession?.tenant?.name}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{userSession?.user?.name}</p>
              <p className="text-xs text-slate-400">{userSession?.role?.name}</p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20"
            >
              Salir
            </button>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default AdminLayout;