import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, X, MapPin, Phone, Mail } from "lucide-react";
import "../Contact/Contact.css";
import { Link } from "react-router-dom";
import contactHero from "../../images/cntct.png";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [emailError, setEmailError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToastMsg = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      5002,
    );
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      if (value && !validateEmail(value)) {
        setEmailError("Please enter a valid email format (e.g. name@mail.com)");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(form.email)) {
      showToastMsg(
        "Invalid Email: Please check your email format before sending.",
        "error",
      );
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/inquiries/submit",
        form,
      );
      if (res.data.success) {
        showToastMsg(
          "Success! MediQ Team has received your professional inquiry.",
        );
        setForm({ name: "", email: "", message: "" });
        setEmailError("");
      }
    } catch (err) {
      showToastMsg("Submission failed. Please try again later.", "error");
    }
  };

  return (
    <div className="mq-v4-root">
      {toast.show && (
        <div
          className={`adm-notification-toast ${toast.type === "error" ? "error-variant" : "success-variant"}`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <div>
            <strong>{toast.type === "success" ? "Success:" : "Error:"}</strong>{" "}
            {toast.message}
          </div>
          <X
            size={16}
            onClick={() => setToast({ ...toast, show: false })}
            className="mq-v4-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <section className="mq-v4-section">
        <div className="mq-v4-container mq-v4-hero-layout">
          <div className="mq-v4-hero-text">
            <h1 className="mq-v4-hero-title">
              Contact Our <br /> Support Team
            </h1>
            <p className="mq-v4-hero-subtitle">
              Reach out to MediQ for assistance with appointments, platform
              inquiries, and general support related to your healthcare
              experience.
            </p>
            <div className="mq-v4-hero-actions">
              <Link to="/doctors" className="mq-v4-btn-black">
                Find Doctors
              </Link>
              <Link to="/about" className="mq-v4-btn-black">
                About Us
              </Link>
            </div>
          </div>
          <div className="mq-v4-hero-image-wrap">
            <img
              src={contactHero}
              alt="Professional Contact Support"
              className="mq-v4-hero-image"
              style={{ filter: "none" }}
            />
          </div>
        </div>
      </section>

      <section className="mq-v4-section">
        <div className="mq-v4-container">
          <div className="mq-v4-section-header">
            <h2 className="mq-v4-section-title">Get in Touch with MediQ</h2>
            <p className="mq-v4-section-subtitle">
              Contact details to help you connect with our support team quickly
              and conveniently.
            </p>
          </div>
          <div className="mq-v4-info-grid">
            <div className="mq-v4-info-card">
              <label>
                <MapPin size={16} /> Address
              </label>
              <p className="mq-v4-info-text">Ahmedabad, Gujarat, India</p>
            </div>
            <div className="mq-v4-info-card">
              <label>
                <Phone size={16} /> Helpline
              </label>
              <p className="mq-v4-info-text">+91 98765 43210</p>
            </div>
            <div className="mq-v4-info-card">
              <label>
                <Mail size={16} /> Email
              </label>
              <p className="mq-v4-info-text">support@mediq.com</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mq-v4-section">
        <div className="mq-v4-container">
          <div className="mq-v4-form-wrapper">
            <h2 className="mq-v4-form-title">Send Your Inquiry</h2>
            <form onSubmit={handleSubmit}>
              <label className="mq-v4-form-label">Full Name</label>
              <input
                className="mq-v4-input mq-v4-input-strong"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label className="mq-v4-form-label">Email Address</label>
              <input
                className={`mq-v4-input mq-v4-input-strong ${emailError ? "mq-v4-input-error" : ""}`}
                type="text"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              {emailError && <p className="mq-v4-error-text">{emailError}</p>}

              <label className="mq-v4-form-label">How can we help?</label>
              <textarea
                className="mq-v4-input mq-v4-input-strong"
                name="message"
                rows="5"
                placeholder="Please share your inquiry or support request..."
                value={form.message}
                onChange={handleChange}
                required
              ></textarea>

              <button type="submit" className="mq-v4-submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mq-v4-section mq-v4-map-section">
        <div className="mq-v4-container">
          <h2 className="mq-v4-map-title">Our Location</h2>
          <div className="mq-v4-map-frame">
            <iframe
              title="MediQ Location"
              src="https://www.google.com/maps?q=Ahmedabad,Gujarat,India&z=13&output=embed"
              width="100%"
              height="450"
              className="mq-v4-map-iframe"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
