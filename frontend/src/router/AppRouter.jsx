import { BrowserRouter, Route, Routes } from "react-router";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Clients from "../pages/Clients";
import Operations from "../pages/Operations";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="operations" element={<Operations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;