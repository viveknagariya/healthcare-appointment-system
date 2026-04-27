import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="mediq-footer">
      <div className="mediq-footer-container">
        <div className="mediq-footer-section">
          <h3 className="mediq-footer-logo">MediQ</h3>
          <p className="mediq-footer-description">
            Trusted healthcare platform for appointments & medical support.
          </p>
        </div>

        <div className="mediq-footer-section">
          <h4 className="mediq-footer-heading">Quick Links</h4>

          <Link to="/" onClick={handleScrollTop} className="mediq-footer-link">
            Home
          </Link>

          <Link
            to="/about"
            onClick={handleScrollTop}
            className="mediq-footer-link"
          >
            About Us
          </Link>

          <Link
            to="/contact"
            onClick={handleScrollTop}
            className="mediq-footer-link"
          >
            Contact Us
          </Link>

          <Link
            to="/doctors"
            onClick={handleScrollTop}
            className="mediq-footer-link"
          >
            Doctors
          </Link>
        </div>

        <div className="mediq-footer-section">
          <h4 className="mediq-footer-heading">Support</h4>
          <p className="mediq-footer-info">support@mediq.com</p>
          <p className="mediq-footer-info">Mon - Sat: 9:00 AM - 8:00 PM</p>
        </div>
      </div>

      <div className="mediq-footer-bottom">
        © {new Date().getFullYear()} MediQ. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
