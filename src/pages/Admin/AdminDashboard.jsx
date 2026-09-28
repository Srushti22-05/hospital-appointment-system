import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, apptRes] = await Promise.all([
          axiosInstance.get("/users/all", { headers }),
          axiosInstance.get("/appointments/all", { headers }),
        ]);

        setUsers(usersRes.data);
        setAppointments(apptRes.data);
      } catch (err) {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalDoctors = users.filter((u) => u.role === "doctor").length;
  const totalPatients = users.filter((u) => u.role === "patient").length;

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
      <h2>Admin Dashboard</h2>
      <p className="text-muted">Overview of doctors, patients, and appointments.</p>

      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm border-0 text-center" style={{ borderRadius: "12px" }}>
                <div className="card-body">
                  <p className="text-muted mb-1">Total Doctors</p>
                  <h2 className="mb-0">{totalDoctors}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm border-0 text-center" style={{ borderRadius: "12px" }}>
                <div className="card-body">
                  <p className="text-muted mb-1">Total Patients</p>
                  <h2 className="mb-0">{totalPatients}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm border-0 text-center" style={{ borderRadius: "12px" }}>
                <div className="card-body">
                  <p className="text-muted mb-1">Total Appointments</p>
                  <h2 className="mb-0">{appointments.length}</h2>
                </div>
              </div>
            </div>
          </div>

          <h4 className="mb-3">All Appointments</h4>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt._id}>
                    <td>{appt.patient?.name}</td>
                    <td>{appt.doctor?.name}</td>
                    <td>{appt.date}</td>
                    <td>{appt.time}</td>
                    <td>
                      <span className={`badge ${statusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;