import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

// Time slots: 09:00 AM to 04:30 PM, every 30 minutes
const SLOTS = [];
for (let h = 9; h < 17; h++) {
  for (const m of ["00", "30"]) {
    const hour12 = h > 12 ? h - 12 : h;
    const suffix = h >= 12 ? "PM" : "AM";
    SLOTS.push(`${String(hour12).padStart(2, "0")}:${m} ${suffix}`);
  }
}

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({ date: "", time: "" });
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get("/users/doctors");
        setDoctors(res.data);
      } catch (err) {
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleBookClick = (doctorId) => {
    setSelectedDoctor(doctorId);
    setBookingData({ date: "", time: "" });
    setMessage({ text: "", type: "" });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        "/appointments/book",
        {
          doctorId: selectedDoctor,
          date: bookingData.date,
          time: bookingData.time,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: "Appointment booked successfully!", type: "success" });
      setSelectedDoctor(null);
      setBookingData({ date: "", time: "" });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Booking failed",
        type: "danger",
      });
    }
  };

  return (
    <div className="container mt-5">
      <h2>Patient Dashboard</h2>
      <p className="text-muted">
        Welcome, Patient! Here are the available doctors:
      </p>

      {loading && <p>Loading doctors...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="row">
        {doctors.map((doctor) => (
          <div className="col-md-4 mb-4" key={doctor._id}>
            <div
              className="card shadow-sm border-0 h-100"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body text-center p-4">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "60px",
                    height: "60px",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {doctor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <h5 className="card-title mb-1">{doctor.name}</h5>
                <p className="text-muted small mb-3">{doctor.email}</p>

                {selectedDoctor === doctor._id ? (
                  <form onSubmit={handleBookingSubmit}>
                    <input
                      type="date"
                      className="form-control mb-2"
                      min={new Date().toLocaleDateString("en-CA")}
                      value={bookingData.date}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, date: e.target.value })
                      }
                      required
                    />
                    <select
                      className="form-select mb-2"
                      value={bookingData.time}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, time: e.target.value })
                      }
                      required
                    >
                      <option value="">Select time slot</option>
                      {SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="btn btn-success w-100 rounded-pill mb-2"
                    >
                      Confirm Booking
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 rounded-pill"
                      onClick={() => setSelectedDoctor(null)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    className="btn btn-primary w-100 rounded-pill"
                    onClick={() => handleBookClick(doctor._id)}
                  >
                    Book Appointment
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

export default PatientDashboard;