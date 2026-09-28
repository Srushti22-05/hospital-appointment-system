import React from "react";

const roles = [
  {
    title: "Patients",
    text: "Search doctors, book appointments and track their status.",
  },
  {
    title: "Doctors",
    text: "View appointments and confirm, cancel or complete them.",
  },
  {
    title: "Admins",
    text: "Monitor total doctors, patients and every appointment.",
  },
];

const steps = [
  { number: "1", title: "Create an account", text: "Register as a patient or a doctor in a minute." },
  { number: "2", title: "Choose a doctor", text: "Browse the available doctors and pick a date and time slot." },
  { number: "3", title: "Get confirmed", text: "The doctor confirms your appointment and you can track its status." },
];

const About = () => {
  return (
    <div className="container py-5">
      <h2 className="mb-3">About Hospital MS</h2>
      <p className="text-muted mb-5" style={{ maxWidth: "700px" }}>
        Hospital MS is a web platform that connects patients, doctors and
        hospital staff. It replaces phone calls and paper registers with a
        simple online appointment system, with a separate dashboard for each
        role.
      </p>

      <div className="row mb-5">
        {roles.map((r) => (
          <div className="col-md-4 mb-3" key={r.title}>
            <div
              className="card shadow-sm border-0 h-100"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-4">
                <h5>{r.title}</h5>
                <p className="text-muted mb-0">{r.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h4 className="mb-4">How it works</h4>
      <div className="row">
        {steps.map((s) => (
          <div className="col-md-4 mb-3" key={s.number}>
            <div className="d-flex">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                style={{ width: "40px", height: "40px", fontWeight: "bold" }}
              >
                {s.number}
              </div>
              <div>
                <h6 className="mb-1">{s.title}</h6>
                <p className="text-muted small mb-0">{s.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;