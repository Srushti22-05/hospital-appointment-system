import React, { useEffect, useState } from "react";

const SAMPLES = [
  { name: "Dr. Sharma", specialization: "General Physician", daysAhead: 1, time: "10:00 AM", status: "confirmed" },
  { name: "Dr. Mehta", specialization: "Dermatologist", daysAhead: 2, time: "11:30 AM", status: "pending" },
  { name: "Dr. Iyer", specialization: "Cardiologist", daysAhead: 3, time: "02:00 PM", status: "confirmed" },
  { name: "Dr. Kulkarni", specialization: "Orthopedic", daysAhead: 4, time: "09:30 AM", status: "confirmed" },
  { name: "Dr. Deshmukh", specialization: "Gynecologist", daysAhead: 5, time: "03:30 PM", status: "pending" },
  { name: "Dr. Joshi", specialization: "Pediatrician", daysAhead: 6, time: "12:00 PM", status: "confirmed" },
];

// Aaj + N din, YYYY-MM-DD format mein (kabhi purani nahi hogi)
const futureDate = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toLocaleDateString("en-CA");
};

const SampleAppointmentCard = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SAMPLES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const appt = SAMPLES[index];
  const initials = appt.name.replace("Dr. ", "").slice(0, 2).toUpperCase();

  return (
    <div className="card border-0 shadow text-dark" style={{ borderRadius: "16px" }}>
      <div className="card-body p-4">
        <p className="text-muted small text-uppercase mb-3">Upcoming appointment (sample)</p>

        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
            style={{ width: "48px", height: "48px", fontWeight: "bold" }}
          >
            {initials}
          </div>
          <div>
            <h6 className="mb-0">{appt.name}</h6>
            <small className="text-muted">{appt.specialization}</small>
          </div>
        </div>

        <p className="mb-1">
          <strong>Date:</strong> {futureDate(appt.daysAhead)}
        </p>
        <p className="mb-3">
          <strong>Time:</strong> {appt.time}
        </p>
        <span className={`badge ${appt.status === "confirmed" ? "bg-success" : "bg-warning text-dark"}`}>
          {appt.status}
        </span>

        <div className="d-flex gap-2 mt-3">
          {SAMPLES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show sample ${i + 1}`}
              onClick={() => setIndex(i)}
              className="border-0 rounded-circle p-0"
              style={{
                width: "8px",
                height: "8px",
                background: i === index ? "#0d6efd" : "#ced4da",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SampleAppointmentCard;