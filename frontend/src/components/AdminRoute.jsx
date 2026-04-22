import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Wraps routes that require admin role.
 * Redirects unauthenticated users to /login.
 * Redirects non-admin users to /quizzes.
 */
function AdminRoute({ children }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/quizzes" replace />;
  }

  return children;
}

export default AdminRoute;
