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

// Purane doctors ke paas approvalStatus nahi hota, unhe approved maano
const approvalOf = (u) => u.approvalStatus || "approved";

const approvalColor = (status) =>
  status === "pending"
    ? "bg-warning text-dark"
    : status === "rejected"
    ? "bg-danger"
    : "bg-success";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", specialization: "", fees: "", qualification: "" });

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

  const allDoctors = users.filter((u) => u.role === "doctor");
  const doctors = allDoctors.filter((u) => approvalOf(u) === "approved");
  const doctorRequests = allDoctors.filter((u) => approvalOf(u) !== "approved");
  const pendingCount = allDoctors.filter((u) => approvalOf(u) === "pending").length;
  const totalPatients = users.filter((u) => u.role === "patient").length;

  const startEdit = (doctor) => {
    setEditingId(doctor._id);
    setEditData({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
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

  // Doctor ko approve ya reject karo
  const handleApproval = async (id, status) => {
    let reason = "";

    if (status === "rejected") {
      const input = window.prompt("Reason for rejection (doctor ko login par dikhega):");
      if (input === null) return; // admin ne cancel kar diya
      reason = input.trim();
    }

    try {
      const res = await axiosInstance.patch(
        `/users/doctors/${id}/approval`,
        { status, reason },
        { headers }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...res.data.doctor } : u))
      );
      setMessage({
        text: `Doctor ${status === "approved" ? "approved" : "rejected"} successfully`,
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Action failed",
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
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm border-0 text-center" style={{ borderRadius: "12px" }}>
                <div className="card-body">
                  <p className="text-muted mb-1">Approved Doctors</p>
                  <h2 className="mb-0">{doctors.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm border-0 text-center" style={{ borderRadius: "12px" }}>
                <div className="card-body">
                  <p className="text-muted mb-1">Pending Requests</p>
                  <h2 className="mb-0">{pendingCount}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm border-0 text-center" style={{ borderRadius: "12px" }}>
                <div className="card-body">
                  <p className="text-muted mb-1">Total Patients</p>
                  <h2 className="mb-0">{totalPatients}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm border-0 text-center" style={{ borderRadius: "12px" }}>
                <div className="card-body">
                  <p className="text-muted mb-1">Total Appointments</p>
                  <h2 className="mb-0">{appointments.length}</h2>
                </div>
              </div>
            </div>
          </div>

          <h4 className="mb-3">Doctor Requests</h4>
          <div className="table-responsive mb-5">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Fees (₹)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctorRequests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No pending doctor requests.
                    </td>
                  </tr>
                )}
                {doctorRequests.map((doc) => {
                  const status = approvalOf(doc);
                  return (
                    <tr key={doc._id}>
                      <td>{doc.name}</td>
                      <td>{doc.email}</td>
                      <td>{doc.specialization || <span className="text-muted">Not set</span>}</td>
                      <td>{doc.qualification || <span className="text-muted">Not provided</span>}</td>
                      <td>{doc.fees ? `₹${doc.fees}` : <span className="text-muted">Not set</span>}</td>
                      <td>
                        <span className={`badge ${approvalColor(status)}`}>{status}</span>
                        {status === "rejected" && doc.rejectionReason && (
                          <div className="text-muted small mt-1">{doc.rejectionReason}</div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApproval(doc._id, "approved")}
                          >
                            Approve
                          </button>
                          {status === "pending" && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleApproval(doc._id, "rejected")}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h4 className="mb-3">Manage Doctors</h4>
          <div className="table-responsive mb-5">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Fees (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No approved doctors yet.
                    </td>
                  </tr>
                )}
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
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. MBBS, MD"
                          value={editData.qualification}
                          onChange={(e) =>
                            setEditData({ ...editData, qualification: e.target.value })
                          }
                        />
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
                      <td>{doc.qualification || <span className="text-muted">Not set</span>}</td>
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
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No appointments yet.
                    </td>
                  </tr>
                )}
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