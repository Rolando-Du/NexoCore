const AuthLayout = ({ children }) => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      {children}
    </main>
  );
};

export default AuthLayout;