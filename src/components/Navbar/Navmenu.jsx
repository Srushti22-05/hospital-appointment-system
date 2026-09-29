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
    <nav className="d-flex justify-content-between align-items-center px-4 py-2 bg-white border-bottom">
      <div className="d-flex gap-4">
        <Link to="/home" className="text-decoration-none text-dark">
          Home
        </Link>
        <Link to="/about" className="text-decoration-none text-dark">
          About
        </Link>
        <Link to="/contact" className="text-decoration-none text-dark">
          Contact
        </Link>
      </div>

      <div className="d-flex gap-3 align-items-center">
        {user ? (
          <>
            <Link to={dashboardLink} className="text-decoration-none text-dark">
              Dashboard
            </Link>
            <span className="text-muted small">Hi, {user.name}</span>
            <button
              className="btn btn-outline-danger btn-sm rounded-pill px-3"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navmenu;