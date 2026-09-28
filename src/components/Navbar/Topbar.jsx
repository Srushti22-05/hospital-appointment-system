import React from "react";
import { Link } from "react-router";

const Topbar = () => {
  return (
    <div className="d-flex align-items-center px-3 py-2">
      <Link to="/home" className="text-decoration-none">
        <h4 className="m-0">🏥 Hospital MS</h4>
      </Link>
    </div>
  );
};

export default Topbar;