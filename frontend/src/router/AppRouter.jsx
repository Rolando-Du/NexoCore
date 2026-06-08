import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Clients from "../pages/Clients";
import Operations from "../pages/Operations";
import Notifications from "../pages/Notifications";
import Evidences from "../pages/Evidences";
import Audit from "../pages/Audit";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Users from "../pages/Users";

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

          <Route
            path="users"
            element={
              <ProtectedRoute permissions={["users:read"]}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="clients"
            element={
              <ProtectedRoute permissions={["clients:read"]}>
                <Clients />
              </ProtectedRoute>
            }
          />

          <Route
            path="operations"
            element={
              <ProtectedRoute permissions={["operations:read"]}>
                <Operations />
              </ProtectedRoute>
            }
          />

          <Route
            path="evidences"
            element={
              <ProtectedRoute permissions={["operations:read"]}>
                <Evidences />
              </ProtectedRoute>
            }
          />

          <Route
            path="audit"
            element={
              <ProtectedRoute permissions={["audit:read"]}>
                <Audit />
              </ProtectedRoute>
            }
          />

          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;