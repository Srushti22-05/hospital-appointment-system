import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axiosInstance.get("/appointments/doctor-appointments", { headers });
        setAppointments(res.data);
      } catch (err) {
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.patch(`/appointments/${id}/status`, { status }, { headers });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const statusColor = (status) =>
    status === "pending"
      ? "bg-warning"
      : status === "confirmed"
      ? "bg-success"
      : status === "cancelled"
      ? "bg-danger"
      : "bg-secondary";

  return (
    <div className="container mt-5">
      <h2>Doctor Dashboard</h2>
      <p className="text-muted">Here are your appointments:</p>

      {loading && <p>Loading appointments...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && appointments.length === 0 && (
        <p className="text-muted">No appointments yet.</p>
      )}

      <div className="row">
        {appointments.map((appt) => (
          <div className="col-md-4 mb-4" key={appt._id}>
            <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
              <div className="card-body">
                <h5 className="card-title">{appt.patient?.name}</h5>
                <p className="text-muted small mb-2">{appt.patient?.email}</p>
                <p className="mb-1"><strong>Date:</strong> {appt.date}</p>
                <p className="mb-2"><strong>Time:</strong> {appt.time}</p>
                <span className={`badge ${statusColor(appt.status)} mb-3`}>
                  {appt.status}
                </span>

                {appt.status === "pending" && (
                  <div className="d-flex gap-2 mt-2">
                    <button
                      className="btn btn-success btn-sm w-50"
                      onClick={() => updateStatus(appt._id, "confirmed")}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm w-50"
                      onClick={() => updateStatus(appt._id, "cancelled")}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {appt.status === "confirmed" && (
                  <button
                    className="btn btn-primary btn-sm w-100 mt-2"
                    onClick={() => updateStatus(appt._id, "completed")}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;