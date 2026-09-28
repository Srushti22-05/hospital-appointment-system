import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form:", formData);
    setSent(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Contact Us</h2>
      <div className="row">
        <div className="col-md-5 mb-4">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: "12px" }}>
            <div className="card-body p-4">
              <h5 className="mb-3">Get in touch</h5>
              <p className="mb-2">📍 Nagpur, Maharashtra</p>
              <p className="mb-2">📧 support@hospitalms.com</p>
              <p className="mb-0">📞 +91 00000 00000</p>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          {sent && (
            <div className="alert alert-success">
              Thanks! Your message has been sent.
            </div>
          )}
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
              <label className="form-label">Message</label>
              <textarea
                name="message"
                rows="4"
                className="form-control"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary rounded-pill px-4">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;