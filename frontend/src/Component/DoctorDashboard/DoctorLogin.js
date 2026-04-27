import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, AlertCircle, CheckCircle, X } from "lucide-react";
import {
  useEncryptedStorage,
  passwordEncrypted,
} from "../../Services/useEncryptedStorage";
import "./DoctorLogin.css";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { save, load } = useEncryptedStorage("secureData");

  useEffect(() => {
    const checkSession = async () => {
      const data = await load(passwordEncrypted);
      if (data) {
        if (data.role === "doctor") {
          navigate("/doctor-dashboard");
        } else if (data.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/patient-dashboard");
        }
      }
    };

    checkSession();
  }, [navigate, load]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/doctors/login", {
        email: email.toLowerCase().trim(),
        password,
      });

      if (res.data.success) {
        const doctor = res.data.doctor;

        if (doctor.status === "Active" || doctor.status === "Approved") {
          localStorage.removeItem("doctorId");
          localStorage.removeItem("doctorName");
          localStorage.removeItem("isDoctorLoggedIn");

          await save(
            {
              name: doctor.fullName,
              role: "doctor",
              userId: doctor._id,
              image: doctor.image,
            },
            passwordEncrypted,
          );

          setError("");
          setShowSuccessToast(true);

          setTimeout(() => {
            setShowSuccessToast(false);
            navigate("/doctor-dashboard");
          }, 5002);
        } else {
          setError("Doctor not approved by admin!");
          setTimeout(() => setError(""), 5002);
        }
      }
    } catch (err) {
      setShowSuccessToast(false);
      const msg =
        err.response?.data?.message || "Login Failed. Please try again.";
      setError(msg);
      setTimeout(() => setError(""), 5002);
    }
  };

  return (
    <div className="adm-portal-wrapper">
      {error && (
        <div className="adm-notification-toast error-variant">
          <AlertCircle size={20} />
          <div>
            <strong>Error:</strong> {error}
          </div>
          <X
            size={16}
            onClick={() => setError("")}
            className="adm-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      {showSuccessToast && (
        <div className="adm-notification-toast success-variant">
          <CheckCircle size={20} />
          <div>
            <strong>Success:</strong> Login Successful! Redirecting...
          </div>
          <X
            size={16}
            onClick={() => setShowSuccessToast(false)}
            className="adm-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <div className="adm-login-container">
        <div className="adm-login-header">
          <ShieldCheck size={44} color="#1A1F2C" />
          <h1 className="adm-main-title">Doctor Portal</h1>
          <p className="adm-sub-text">Secure Doctor Access</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="adm-input-group">
            <label className="adm-field-label">Email Address</label>
            <div className="adm-input-control">
              <input
                type="email"
                placeholder="doctor@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="adm-input-group">
            <label className="adm-field-label">Password</label>
            <div className="adm-input-control">
              <input
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="adm-submit-btn2">
            Login to Dashboard
          </button>
          <div className="adm-register-option">
            New Doctor?{" "}
            <Link to="/doctor-register" className="adm-register-link">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorLogin;
