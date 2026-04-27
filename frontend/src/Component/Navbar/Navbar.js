import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuthUser } from "../../Services/useAuthUser";

const Navbar = () => {
    const navigate = useNavigate();
  const { user, loadingForSession } = useAuthUser();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (loadingForSession) return <div></div>;
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-text">MediQ</span>
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={`nav-center ${menuOpen ? "active" : ""}`}>
          <NavLink
            to="/"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            HOME
          </NavLink>
          <NavLink
            to="/about"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            ABOUT
          </NavLink>
          <NavLink
            to="/contact"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            CONTACT
          </NavLink>
          <NavLink
            to="/doctors"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            DOCTOR
          </NavLink>
        </nav>

        {(user != null) ? <div className="nav-right color-white">Welcome, {user.name}! &nbsp;<button className="nav-login" onClick={() => {
          if(user.role === "patient"){
            navigate("/patient-dashboard");
          }
          else if(user.role === "doctor"){
            navigate("/doctor-dashboard");
          }
          else if(user.role === "admin"){
            navigate("/admin-dashboard");
          }
        }}>
          Dashboard
        </button></div> : <div className="nav-right" ref={dropdownRef}>
          <button className="nav-login" onClick={() => setOpen(!open)}>
            LOGIN
          </button>

          {open && (
            <div className="nav-dropdown">
              <Link
                className="nav-drop-item"
                to="/login"
                onClick={() => setOpen(false)}
              >
                Patient Login
              </Link>
              <Link
                className="nav-drop-item"
                to="/doctor-login"
                onClick={() => setOpen(false)}
              >
                Doctor Login
              </Link>
              <Link
                className="nav-drop-item"
                to="/login/admin"
                onClick={() => setOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          )}
        </div>}
      </div>
    </header>
  );
};

export default Navbar;
