import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Usuarios",
    path: "/users",
  },
  {
    label: "Clientes",
    path: "/clients",
  },
  {
    label: "Operaciones",
    path: "/operations",
  },
  {
    label: "Evidencias",
    path: "/evidences",
  },
  {
    label: "Auditoría",
    path: "/audit",
  },
  {
    label: "Notificaciones",
    path: "/notifications",
  },
];

const getNavLinkClass = ({ isActive }) => {
  return `block rounded-lg px-3 py-2 ${
    isActive
      ? "bg-cyan-500/10 text-cyan-300"
      : "text-slate-200 hover:bg-slate-800 hover:text-cyan-400"
  }`;
};

const AdminLayout = () => {
  const { userSession, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <aside className="hidden w-64 border-r border-slate-800 bg-slate-900/70 p-6 md:block">
        <h1 className="text-2xl font-bold text-cyan-400">NexoCore</h1>
        <p className="mt-1 text-xs text-slate-400">Enterprise SaaS</p>

        <nav className="mt-8 space-y-3 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={getNavLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/70"
          />

          <aside className="relative z-10 h-full w-72 border-r border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-cyan-400">
                  NexoCore
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Enterprise SaaS
                </p>
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>

            <nav className="mt-8 space-y-3 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMobileMenu}
                  className={getNavLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-8 w-full rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300 hover:bg-red-500/20"
            >
              Salir
            </button>
          </aside>
        </div>
      )}

      <section className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-cyan-400 md:hidden"
            >
              ☰
            </button>

            <div className="min-w-0">
              <p className="text-sm text-slate-400">Empresa</p>
              <p className="truncate font-semibold">
                {userSession?.tenant?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {userSession?.user?.name}
              </p>
              <p className="text-xs text-slate-400">
                {userSession?.role?.name}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20"
            >
              Salir
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default AdminLayout;