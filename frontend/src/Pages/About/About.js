import React, { useEffect } from "react";
import "../About/About.css";
import { Link } from "react-router-dom";
import heroImg from "../../images/aboutus.png";
import Excare from "../../images/care.png";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      t: "Doctor Discovery",
      d: "Browse available doctors by specialization and find the right consultation option for your needs.",
    },
    {
      t: "Online Appointment Booking",
      d: "Book appointments with registered doctors through a simple and convenient online process.",
    },
    {
      t: "Patient Health Records",
      d: "Maintain and access essential medical information through a secure digital patient profile.",
    },
    {
      t: "Appointment Management",
      d: "Review and manage scheduled appointments from one organized platform.",
    },
    {
      t: "Specialist Directory",
      d: "Explore doctors across different specialties and experience levels with ease.",
    },
    {
      t: "Support Assistance",
      d: "Reach out to the support team for help with bookings, inquiries, and platform-related guidance.",
    },
  ];

  const bookingSteps = [
    {
      n: "01",
      t: "Search for a Doctor",
      d: "Review available doctors based on your preferred speciality and consultation needs.",
    },
    {
      n: "02",
      t: "Choose a Suitable Slot",
      d: "Select an appointment time that matches your schedule.",
    },
    {
      n: "03",
      t: "Complete the Required Details",
      d: "Provide the necessary patient information to confirm the booking request.",
    },
    {
      n: "04",
      t: "Receive Confirmation",
      d: "Proceed with your scheduled consultation through a streamlined booking experience.",
    },
  ];

  return (
    <div className="mq-v3-root">
      <section className="mq-v3-row">
        <div className="mq-v3-container mq-v3-hero-flex">
          <div className="mq-v3-hero-left">
            <h1 className="mq-v3-title">
              Reliable Digital <br /> Healthcare Support
            </h1>
            <p className="mq-v3-subtitle">
              MediQ helps patients connect with doctors, book appointments,
              manage health records, and access support services through one
              organized healthcare platform.
            </p>
            <div className="mq-v3-hero-actions">
              <Link to="/doctors" className="mq-v3-btn-oval">
                Find Doctors
              </Link>
              <Link to="/contact" className="mq-v3-btn-oval">
                Contact Support
              </Link>
            </div>
          </div>
          <div className="mq-v3-hero-right">
            <div className="mq-v3-rect-img">
              <img
                src={heroImg}
                alt="Professional Care"
                style={{ filter: "none" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mq-v3-row">
        <div className="mq-v3-container">
          <div className="mq-v3-section-header">
            <h2 className="mq-v3-section-title">How MediQ Supports Patients</h2>
            <p className="mq-v3-section-subtitle">
              Core platform features designed to simplify doctor discovery,
              appointment booking, and patient support.
            </p>
          </div>
          <div className="mq-v3-grid-6">
            {services.map((item, i) => (
              <div className="mq-v3-service-card" key={i}>
                <h3 className="mq-v3-service-title">{item.t}</h3>
                <p className="mq-v3-service-desc">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mq-v3-row">
        <div className="mq-v3-container">
          <h2 className="mq-v3-steps-title">
            Your Four-Step Appointment Process
          </h2>
          <div className="mq-v3-steps-grid">
            {bookingSteps.map((step, i) => (
              <div className="mq-v3-step-card" key={i}>
                <span className="mq-v3-step-number">{step.n}</span>
                <h3 className="mq-v3-step-title">{step.t}</h3>
                <p className="mq-v3-step-desc">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mq-v3-row">
        <div className="mq-v3-container mq-v3-care-grid">
          <div>
            <h2 className="mq-v3-care-title">
              Focused on Accessible Healthcare
            </h2>
            <p className="mq-v3-care-text">
              Our goal is to make healthcare access more convenient through a
              platform that supports doctor appointments, patient records, and
              responsive assistance in one place.
            </p>
            <div className="mq-v3-care-points">
              <p className="mq-v3-care-point">✔ 500+ Verified Specialists</p>
              <p className="mq-v3-care-point">
                ✔ Secure Digital Patient Support
              </p>
              <p className="mq-v3-care-point">✔ 24/7 Support Availability</p>
            </div>
          </div>
          <img
            src={Excare}
            alt="Medical Trust"
            className="mq-v3-care-image"
            style={{ filter: "none" }}
          />
        </div>
      </section>

      <section className="mq-v3-row mq-v3-cta-section">
        <div className="mq-v3-container">
          <div className="mq-v3-cta-box">
            <h2>Ready to Schedule Your Consultation?</h2>
            <p className="mq-v3-cta-text">
              Find the right doctor and begin your appointment journey through
              MediQ today.
            </p>
            <Link
              to="/doctors"
              onClick={() => window.scrollTo(0, 0)}
              className="mq-v3-btn-oval mq-v3-btn-light"
            >
              Book Your Appointment Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
