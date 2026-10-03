import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Stethoscope, CalendarCheck, ClipboardCheck, LayoutDashboard, ArrowRight } from "lucide-react";
import SampleAppointmentCard from "../components/SampleAppointmentCard";

const features = [
  {
    Icon: Stethoscope,
    title: "Find Doctors",
    text: "Browse available doctors and choose the one you need.",
    role: "patient",
    path: "/patient-dashboard",
  },
  {
    Icon: CalendarCheck,
    title: "Book Appointments",
    text: "Pick a date and time and book in a few clicks.",
    role: "patient",
    path: "/patient-dashboard",
  },
  {
    Icon: ClipboardCheck,
    title: "Manage Visits",
    text: "Doctors confirm, cancel or complete their appointments.",
    role: "doctor",
    path: "/doctor-dashboard",
  },
  {
    Icon: LayoutDashboard,
    title: "Admin Overview",
    text: "Admins track all doctors, patients and appointments.",
    role: "admin",
    path: "/admin-dashboard",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const dashboardLink =
    user?.role === "patient"
      ? "/patient-dashboard"
      : user?.role === "doctor"
      ? "/doctor-dashboard"
      : "/admin-dashboard";

  const handleFeatureClick = (feature) => {
    setNotice(null);

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === feature.role) {
      navigate(feature.path);
    } else {
      const article = user.role === "admin" ? "an" : "a";
      setNotice({
        message: `"${feature.title}" is for ${feature.role}s. You are logged in as ${article} ${user.role}.`,
        requiredRole: feature.role,
      });
    }
  };

  const handleSwitchLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <section
        className="text-white py-5"
        style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)" }}
      >
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-7 mb-4 mb-md-0">
              <span className="badge bg-light text-primary rounded-pill px-3 py-2 mb-3">
                Your Health, Our Priority
              </span>
              <h1 className="display-5 fw-bold">
                Skip the Queue. Book Your Doctor Online.
              </h1>
              <p className="lead mt-3">
                Choose a doctor, pick a time and get your appointment confirmed
                in a few clicks.
              </p>

              <ul className="list-unstyled mb-4">
                <li className="mb-1">✓ Book appointments online</li>
                <li className="mb-1">✓ Doctors confirm or cancel instantly</li>
                <li className="mb-1">
                  ✓ Separate dashboards for patients, doctors and admins
                </li>
              </ul>

              {user ? (
                <Link
                  to={dashboardLink}
                  className="btn btn-light btn-lg rounded-pill px-4"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="d-flex gap-3">
                  <Link
                    to="/register"
                    className="btn btn-light btn-lg rounded-pill px-4"
                  >
                    Book an Appointment
                  </Link>
                  <Link
                    to="/about"
                    className="btn btn-outline-light btn-lg rounded-pill px-4"
                  >
                    Learn More
                  </Link>
                </div>
              )}
            </div>

            <div className="col-md-5">
              <SampleAppointmentCard />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="text-center mb-4">What you can do</h2>

        {notice && (
          <div className="alert alert-warning text-center">
            <p className="mb-2">{notice.message}</p>
            <button
              className="btn btn-primary btn-sm rounded-pill px-3"
              onClick={handleSwitchLogin}
            >
              Login as {notice.requiredRole}
            </button>
          </div>
        )}

        <div className="row">
          {features.map((f) => (
            <div className="col-md-3 mb-4" key={f.title}>
              <div
                className="card shadow-sm border-0 h-100 text-center"
                style={{ borderRadius: "12px", cursor: "pointer" }}
                onClick={() => handleFeatureClick(f)}
              >
                <div className="card-body p-4">
                  <div
                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: "56px", height: "56px" }}
                  >
                    <f.Icon size={26} />
                  </div>
                  <h5 className="mt-1">{f.title}</h5>
                  <p className="text-muted small mb-2">{f.text}</p>
                  <span className="text-primary small d-inline-flex align-items-center gap-1">
                    Open <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;