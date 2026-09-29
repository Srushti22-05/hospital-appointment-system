import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Dentist",
  "ENT Specialist",
  "Gynecologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "Radiologist",
  "Urologist",
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", specialization: "", fees: "" });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
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

  useEffect(() => {
    fetchData();
  }, []);

  const totalDoctors = users.filter((u) => u.role === "doctor").length;
  const totalPatients = users.filter((u) => u.role === "patient").length;
  const doctors = users.filter((u) => u.role === "doctor");

  const startEdit = (doctor) => {
    setEditingId(doctor._id);
    setEditData({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      fees: doctor.fees || "",
    });
    setMessage({ text: "", type: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      const res = await axiosInstance.patch(`/users/doctors/${id}`, editData, { headers });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...res.data.doctor } : u))
      );
      setMessage({ text: "Doctor updated successfully", type: "success" });
      setEditingId(null);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Update failed",
        type: "danger",
      });
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
      <h2>Admin Dashboard</h2>
      <p className="text-muted">Overview of doctors, patients, and appointments.</p>

      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

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

          <h4 className="mb-3">Manage Doctors</h4>
          <div className="table-responsive mb-5">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Fees (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) =>
                  editingId === doc._id ? (
                    <tr key={doc._id}>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      </td>
                      <td>{doc.email}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={editData.specialization}
                          onChange={(e) =>
                            setEditData({ ...editData, specialization: e.target.value })
                          }
                        >
                          <option value="">Select specialization</option>
                          {SPECIALIZATIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          value={editData.fees}
                          onChange={(e) => setEditData({ ...editData, fees: e.target.value })}
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => saveEdit(doc._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={doc._id}>
                      <td>{doc.name}</td>
                      <td>{doc.email}</td>
                      <td>{doc.specialization || <span className="text-muted">Not set</span>}</td>
                      <td>{doc.fees ? `₹${doc.fees}` : <span className="text-muted">Not set</span>}</td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => startEdit(doc)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
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