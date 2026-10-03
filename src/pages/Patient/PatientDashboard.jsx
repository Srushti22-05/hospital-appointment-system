import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Stethoscope, IndianRupee, GraduationCap } from "lucide-react";
import ChatbotWidget from "../../components/ChatbotWidget";

const SLOTS = [];
for (let h = 9; h < 17; h++) {
  for (const m of ["00", "30"]) {
    const hour12 = h > 12 ? h - 12 : h;
    const suffix = h >= 12 ? "PM" : "AM";
    SLOTS.push(`${String(hour12).padStart(2, "0")}:${m} ${suffix}`);
  }
}

const statusColor = (status) =>
  status === "pending"
    ? "bg-warning"
    : status === "confirmed"
    ? "bg-success"
    : status === "cancelled"
    ? "bg-danger"
    : "bg-secondary";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({ date: "", time: "" });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      const [doctorsRes, apptRes] = await Promise.all([
        axiosInstance.get("/users/doctors"),
        axiosInstance.get("/appointments/my-appointments", { headers }),
      ]);
      setDoctors(doctorsRes.data);
      setMyAppointments(apptRes.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Selected doctor + date ke liye already booked slots laao
  const fetchBookedSlots = async () => {
    if (!selectedDoctor || !bookingData.date) {
      setBookedSlots([]);
      return;
    }
    try {
      const res = await axiosInstance.get("/appointments/booked-slots", {
        headers,
        params: { doctorId: selectedDoctor, date: bookingData.date },
      });
      setBookedSlots(Array.isArray(res.data) ? res.data : []);
    } catch {
      setBookedSlots([]);
    }
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [selectedDoctor, bookingData.date]);

  const handleBookClick = (doctorId) => {
    setSelectedDoctor(doctorId);
    setBookingData({ date: "", time: "" });
    setBookedSlots([]);
    setMessage({ text: "", type: "" });
  };

  const handleChatbotSelect = (doctorId) => {
    setActiveTab("doctors");
    handleBookClick(doctorId);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(
        "/appointments/book",
        { doctorId: selectedDoctor, date: bookingData.date, time: bookingData.time },
        { headers }
      );
      setMessage({ text: "Appointment booked successfully!", type: "success" });
      setSelectedDoctor(null);
      setBookingData({ date: "", time: "" });
      setBookedSlots([]);
      setActiveTab("appointments");
      fetchAll();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Booking failed",
        type: "danger",
      });
      // 409 matlab slot already booked: use turant "(Booked)" mark karo
      if (err.response?.status === 409) {
        const takenSlot = bookingData.time;
        setBookedSlots((prev) =>
          prev.includes(takenSlot) ? prev : [...prev, takenSlot]
        );
        setBookingData((prev) => ({ ...prev, time: "" }));
      }
    }
  };

  const handleCancel = async (id) => {
    try {
      await axiosInstance.patch(`/appointments/${id}/cancel`, {}, { headers });
      setMyAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Cancel failed",
        type: "danger",
      });
    }
  };

  return (
    <div className="container mt-5">
      <h2>Patient Dashboard</h2>
      <p className="text-muted">Welcome, Patient!</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            My Appointments
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "doctors" ? "active" : ""}`}
            onClick={() => setActiveTab("doctors")}
          >
            Find a Doctor
          </button>
        </li>
      </ul>

      {loading && <p>Loading...</p>}

      {!loading && activeTab === "appointments" && (
        <>
          {myAppointments.length === 0 && (
            <p className="text-muted">You haven't booked any appointments yet.</p>
          )}
          <div className="row">
            {myAppointments.map((appt) => (
              <div className="col-md-4 mb-3" key={appt._id}>
                <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                  <div className="card-body">
                    <h6 className="mb-1">{appt.doctor?.name}</h6>
                    <p className="text-muted small mb-2">{appt.doctor?.email}</p>
                    <p className="mb-1"><strong>Date:</strong> {appt.date}</p>
                    <p className="mb-2"><strong>Time:</strong> {appt.time}</p>
                    <span className={`badge ${statusColor(appt.status)} mb-2`}>
                      {appt.status}
                    </span>
                    {(appt.status === "pending" || appt.status === "confirmed") && (
                      <button
                        className="btn btn-outline-danger btn-sm w-100 mt-2"
                        onClick={() => handleCancel(appt._id)}
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && activeTab === "doctors" && (
        <div className="row">
          {doctors.map((doctor) => (
            <div className="col-md-4 mb-4" key={doctor._id}>
              <div className="card shadow-sm border-0 h-100" style={{ borderRadius: "12px" }}>
                <div className="card-body text-center p-4">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: "60px", height: "60px", fontSize: "24px", fontWeight: "bold" }}
                  >
                    {doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h5 className="card-title mb-1">{doctor.name}</h5>
                  <p className="text-muted small mb-1">{doctor.email}</p>
                  {doctor.specialization && (
                    <p className="text-muted small mb-1 d-flex align-items-center justify-content-center gap-1">
                      <Stethoscope size={14} /> {doctor.specialization}
                    </p>
                  )}
                  {doctor.qualification && (
                    <p className="text-muted small mb-1 d-flex align-items-center justify-content-center gap-1">
                      <GraduationCap size={14} /> {doctor.qualification}
                    </p>
                  )}
                  {doctor.fees && (
                    <p className="text-muted small mb-3 d-flex align-items-center justify-content-center gap-1">
                      <IndianRupee size={14} /> {doctor.fees}
                    </p>
                  )}

                  {selectedDoctor === doctor._id ? (
                    <form onSubmit={handleBookingSubmit}>
                      <input
                        type="date"
                        className="form-control mb-2"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ date: e.target.value, time: "" })}
                        required
                      />
                      <select
                        className="form-select mb-2"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                        required
                      >
                        <option value="">Select time slot</option>
                        {SLOTS.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <option key={slot} value={slot} disabled={isBooked}>
                              {slot}
                              {isBooked ? " (Booked)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <button type="submit" className="btn btn-success w-100 rounded-pill mb-2">
                        Confirm Booking
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100 rounded-pill"
                        onClick={() => {
                          setSelectedDoctor(null);
                          setBookedSlots([]);
                        }}
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
      )}

      {!loading && <ChatbotWidget doctors={doctors} onSelectDoctor={handleChatbotSelect} />}
    </div>
  );
};

export default PatientDashboard;