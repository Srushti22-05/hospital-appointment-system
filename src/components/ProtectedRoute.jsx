import React from "react";
import { Navigate } from "react-router";

const dashboardFor = (role) =>
  role === "patient"
    ? "/patient-dashboard"
    : role === "doctor"
    ? "/doctor-dashboard"
    : "/admin-dashboard";

const ProtectedRoute = ({ allowedRole, children }) => {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Not logged in -> login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role -> send to their own dashboard
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={dashboardFor(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;