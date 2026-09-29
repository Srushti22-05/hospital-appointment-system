import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, Link } from "react-router";

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

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    specialization: "",
    fees: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...formData };
      if (payload.role !== "doctor") {
        delete payload.specialization;
        delete payload.fees;
      }
      await axiosInstance.post("/auth/register", payload);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light py-5"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <div
        className="card border-0 shadow-sm p-4"
        style={{ maxWidth: "440px", width: "100%", borderRadius: "16px" }}
      >
        <div className="text-center mb-4">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: "56px", height: "56px", fontSize: "24px" }}
          >
            🏥
          </div>
          <h3 className="fw-bold mb-1">Create Account</h3>
          <p className="text-muted small mb-0">Join Hospital MS in a minute</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Register as</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {formData.role === "doctor" && (
            <>
              <div className="mb-3">
                <label className="form-label">Specialization</label>
                <select
                  name="specialization"
                  className="form-select"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Consultation Fees (₹)</label>
                <input
                  type="number"
                  name="fees"
                  className="form-control"
                  min="0"
                  value={formData.fees}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-success w-100 rounded-pill py-2 mt-2">
            Register
          </button>
        </form>

        <p className="text-center text-muted small mt-4 mb-0">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;