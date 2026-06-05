const AuthLayout = ({ children }) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 left-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <section className="relative z-10 flex w-full items-center justify-center">
        {children}
      </section>
    </main>
  );
};

export default AuthLayout;