import React from "react";
import { Link } from "react-router";

const Topbar = () => {
  return (
    <div className="d-flex align-items-center px-4 py-3 border-bottom bg-white">
      <Link to="/home" className="text-decoration-none d-flex align-items-center gap-2">
        <span style={{ fontSize: "24px" }}>🏥</span>
        <h4 className="m-0 fw-bold text-primary">Hospital MS</h4>
      </Link>
    </div>
  );
};

export default Topbar;