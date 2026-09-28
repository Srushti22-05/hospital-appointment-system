import React from "react";
import { Link, useNavigate } from "react-router";

const Navmenu = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const dashboardLink =
    user?.role === "patient"
      ? "/patient-dashboard"
      : user?.role === "doctor"
      ? "/doctor-dashboard"
      : user?.role === "admin"
      ? "/admin-dashboard"
      : "/";

  return (
    <nav className="d-flex justify-content-between align-items-center px-3 py-2">
      <div className="d-flex gap-3">
        <Link to="/home">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <div className="d-flex gap-3 align-items-center">
        {user ? (
          <>
            <Link to={dashboardLink}>Dashboard</Link>
            <span>Hi, {user.name}</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navmenu;