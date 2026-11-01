
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/AuthForm";
import ProtectedRoute from "./ProctectedRoutes";
import ChatPage from "../pages/ChatPage";

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Authentication */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/chat" replace />
          ) : (
            <AuthForm />
          )
        }
      />

      {/* Protected Application */}
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* Unknown Routes */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/chat" : "/"}
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
