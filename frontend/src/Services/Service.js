import React, { useEffect, useState } from "react";
import "../Services/Service.css";
import { Link, useNavigate } from "react-router-dom";
import { X, AlertCircle } from "lucide-react";
import serviceImg from "../images/service.png";

const Services = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const servicesList = [
    {
      id: 1,
      title: "Find Doctor & Book Appointment",
      desc: "Browse available doctors and book appointments through a straightforward online workflow.",
      icon: "🔎",
    },
    {
      id: 2,
      title: "24/7 AI Chatbot Support",
      desc: "Receive chatbot-based assistance at any time for general health-related support.",
      icon: "🤖",
    },
    {
      id: 3,
      title: "Patient Health Records",
      desc: "Access and manage key medical information through a secure patient record system.",
      icon: "📁",
    },
    {
      id: 4,
      title: "Appointment Management",
      desc: "Track and manage appointment activity from one organized platform.",
      icon: "📅",
    },
    {
      id: 5,
      title: "Specialist Directory",
      desc: "Review doctors by speciality and experience to choose the right consultation option.",
      icon: "🏥",
    },
    {
      id: 6,
      title: "Customer Support",
      desc: "Reach the MediQ support team for help with appointments and platform-related inquiries.",
      icon: "💬",
    },
  ];

  const handleExplore = (service) => {
    if (service.title === "Find Doctor & Book Appointment") {
      navigate("/doctors");
    } else if (service.title === "24/7 AI Chatbot Support") {
      navigate("/chatbot");
    } else if (service.title === "Customer Support") {
      navigate("/contact");
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5002);
    }
  };

  return (
    <div className="services-page">
      {showToast && (
        <div className="mediq-toast toast-top">
          <AlertCircle size={20} />
          <div>
            <strong>Login Required:</strong> Please login first.
          </div>
          <X
            size={18}
            onClick={() => setShowToast(false)}
            className="mediq-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <div className="services-hero container">
        <div>
          <h1 className="services-title">
            Digital Healthcare Services for Modern Patient Needs
          </h1>
          <p className="services-subtitle">
            Explore the core MediQ services designed to support doctor booking,
            patient records, appointment management, and healthcare assistance.
          </p>

          <div className="services-hero-actions">
            <Link to="/doctors" className="hero-btn">
              Book My Appointment
            </Link>
            <Link to="/contact" className="hero-btn">
              Contact Support
            </Link>
          </div>
        </div>

        <div className="services-hero-card">
          <img src={serviceImg} alt="Hospital" />
        </div>
      </div>

      <div className="container services-section">
        <h2 className="section-heading">Our Services and Features</h2>

        <div className="services-grid">
          {servicesList.map((service) => (
            <div key={service.id} className="service-card">
              <div>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>

              <button
                onClick={() => handleExplore(service)}
                className="card-btn"
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="services-cta-banner">
          <div>
            <h2>Ready to Get Started with MediQ?</h2>
            <p>
              Connect with doctors, manage appointments, and reach support from
              one healthcare platform.
            </p>
          </div>
          <Link to="/contact" className="btn-white">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
