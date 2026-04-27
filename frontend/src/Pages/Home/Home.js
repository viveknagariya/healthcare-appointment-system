import React, { useEffect, useState } from "react";
import "../Home/Home.css";
import { Link, useLocation } from "react-router-dom";
import {
  Bot,
  Search,
  FileText,
  CalendarDays,
  Stethoscope,
  Headset,
  HeartPulse,
  Sparkles,
  Brain,
  Bone,
} from "lucide-react";
import heroImg from "../../images/home.png";
import femaleDoctor from "../../images/femaledoctor.png";
import maleDoctor from "../../images/maledoctor.png";
import whyChooseImg from "../../images/why.png";

const Home = () => {
  const location = useLocation();
  const [randomDoctors, setRandomDoctors] = useState([
    {
      name: "Dr. A. Sharma",
      dept: "Cardiologist",
      exp: "10+ Years",
      img: femaleDoctor,
    },
    {
      name: "Dr. R. Mehta",
      dept: "Dermatologist",
      exp: "8+ Years",
      img: maleDoctor,
    },
    {
      name: "Dr. P. Verma",
      dept: "Neurologist",
      exp: "12+ Years",
      img: femaleDoctor,
    },
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const fetchRandomDoctors = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/doctors/random?limit=3`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setRandomDoctors(
              data.map((doctor) => ({
                name: doctor.fullName || "Dr. Unknown",
                dept: doctor.specialization || "General Practice",
                exp: doctor.experience
                  ? `${doctor.experience}+ Years`
                  : "Experience Not Listed",
                img:
                  doctor.profileImage ||
                  (doctor.gender === "Female" ? femaleDoctor : maleDoctor),
              })),
            );
          }
        }
      } catch (error) {
        console.log("Using default doctors");
      }
    };

    fetchRandomDoctors();
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  };

  const allServices = [
    {
      id: 1,
      title: "Find Doctor & Book Appointment",
      desc: "Search available doctors and schedule appointments through a simple online process.",
      Icon: Search,
    },
    {
      id: 2,
      title: "24/7 AI Chatbot Support",
      desc: "Access round-the-clock chatbot assistance for common health-related guidance.",
      Icon: Bot,
    },
    {
      id: 3,
      title: "Patient Health Records",
      desc: "Maintain important medical information through a secure digital patient profile.",
      Icon: FileText,
    },
    {
      id: 4,
      title: "Appointment Management",
      desc: "Review and manage upcoming appointments from one convenient dashboard.",
      Icon: CalendarDays,
    },
    {
      id: 5,
      title: "Specialist Directory",
      desc: "Explore doctors across specialties and experience levels with ease.",
      Icon: Stethoscope,
    },
    {
      id: 6,
      title: "Customer Support",
      desc: "Connect with the support team for inquiries related to appointments and platform usage.",
      Icon: Headset,
    },
  ];

  const specializations = [
    { title: "Cardiology", Icon: HeartPulse },
    { title: "Dermatology", Icon: Sparkles },
    { title: "Neurology", Icon: Brain },
    { title: "Orthopedics", Icon: Bone },
  ];

  return (
    <div className="home-page">
      <section className="section">
        <div className="container hero-section">
          <div className="hero-left">
            <h1 className="hero-title">
              Book Appointments <br /> with Trusted Doctors
            </h1>
            <p className="hero-subtitle">
              MediQ helps patients discover doctors, book appointments, manage
              records, and access support through one reliable healthcare
              platform.
            </p>
            <div className="hero-actions">
              <Link
                to="/login"
                className="btn-primary"
                onClick={handleScrollToTop}
              >
                Book Appointment
              </Link>
              <Link
                to="/contact"
                className="btn-primary2"
                onClick={handleScrollToTop}
              >
                Contact Support
              </Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-image-card">
              <img src={heroImg} alt="Healthcare" style={{ filter: "none" }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head home-section-head-centered">
            <h2>Medical Specializations</h2>
            <p>
              Explore key specialties available for consultation through the
              MediQ platform.
            </p>
          </div>
          <div className="grid-4">
            {specializations.map((item, index) => {
              
              const colors = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f"];
              return (
                <div className="specialization-card" key={index}>
                  <div className="specialization-icon">
                    <item.Icon
                      size={28}
                      color={colors[index % colors.length]}
                    />
                  </div>
                  <h3>{item.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row-between responsive-row-between">
            <div className="section-head2">
              <h2>Platform Services</h2>
              <p>
                Explore the core healthcare and support services available
                through MediQ.
              </p>
            </div>
            <Link
              to="/services"
              className="link-dark"
              onClick={handleScrollToTop}
            >
              View All
            </Link>
          </div>
          <div className="home-services-grid">
            {allServices.map((service, idx) => {
              
              const colors = [
                "#1976d2", 
                "#e63946", 
                "#43a047", 
                "#f4a261", 
                "#8e24aa", 
                "#ffb300", 
              ];
              return (
                <div className="home-service-card-layout" key={service.id}>
                  <div className="service-icon-wrapper">
                    <service.Icon
                      size={28}
                      color={colors[idx % colors.length]}
                    />
                  </div>
                  <h3 className="service-title-text">{service.title}</h3>
                  <p className="service-desc-text">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row-between responsive-row-between">
            <div className="section-head3">
              <h2>Featured Doctors</h2>
              <p>
                Browse available doctors listed on MediQ for trusted medical
                consultation.
              </p>
            </div>
            <Link
              to="/doctors"
              className="link-dark"
              onClick={handleScrollToTop}
            >
              View All Doctors
            </Link>
          </div>
          <div className="home-doctors-grid">
            {randomDoctors.map((doctor, index) => (
              <div className="home-doctor-card-layout" key={index}>
                <div className="doctor-card-image-container">
                  <img
                    src={doctor.img}
                    alt={doctor.name}
                    style={{ filter: "none" }}
                  />
                </div>
                <div className="doctor-card-details">
                  <h3 className="doctor-name-text">{doctor.name}</h3>
                  <p className="doctor-speciality-text">{doctor.dept}</p>
                  <p className="doctor-experience-text">{doctor.exp}</p>
                  <Link
                    to="/login"
                    className="doctor-booking-button"
                    onClick={handleScrollToTop}
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="why-box">
            <div className="why-left">
              <h2>Why Choose MediQ?</h2>
              <p>
                Built to simplify doctor access, appointment booking, and
                patient support with confidence.
              </p>
              <ul className="why-list">
                <li>Verified Doctors and Specializations</li>
                <li>Secure Patient Information Management</li>
                <li>Simple Appointment and Support Access</li>
              </ul>
              <Link
                to="/about"
                className="btn-primary home-light-btn"
                onClick={handleScrollToTop}
              >
                Learn More
              </Link>
            </div>
            <div className="why-right">
              <img
                src={whyChooseImg}
                alt="Doctor with Patient"
                style={{ filter: "none" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section home-cta-section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2 className="home-cta-title">
                Need Medical Consultation Today?
              </h2>
              <p className="home-cta-text">
                Connect with available doctors and request your appointment in
                just a few steps.
              </p>
            </div>
            <Link
              to="/doctors"
              className="btn-primary"
              onClick={handleScrollToTop}
            >
              Find Doctors
            </Link>
          </div>
        </div>
      </section>

      <Link
        to="/chatbot"
        className="floating-bot-icon"
        onClick={handleScrollToTop}
      >
        <Bot size={32} color="#ffffff" />
      </Link>
    </div>
  );
};

export default Home;
