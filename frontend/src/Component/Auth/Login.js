import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, X, AlertCircle, Info } from "lucide-react";
import axios from "axios";
import "../Auth/Login.css";
import { useEncryptedStorage, passwordEncrypted } from "../../Services/useEncryptedStorage";

const API_BASE_URLS = [
  process.env.REACT_APP_API_URL,
  "http://localhost:5000",
  "http://localhost:5001",
].filter(Boolean);

const Login = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState(null);
  const [otpToast, setOtpToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [invalidOtp, setInvalidOtp] = useState("");
  const { save, load } = useEncryptedStorage("secureData");

  useEffect(() => {
    
    const checkSession = async () => {
      const data = await load(passwordEncrypted);
      if (data) {
        if(data.role === "doctor") {
          navigate("/doctor-dashboard");
        } else if(data.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/patient-dashboard");
        }
      }
    }
    checkSession();
  }, [navigate, load]);
  
  const postWithFallback = async (path, payload) => {
    let lastError;

    for (const baseUrl of API_BASE_URLS) {
      try {
        return await axios.post(`${baseUrl}${path}`, payload);
      } catch (error) {
        lastError = error;

        if (error.response) {
          throw error;
        }
      }
    }

    throw lastError;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setErrorMsg("Enter 10-digit number");
      setTimeout(() => setErrorMsg(""), 5002);
      return;
    }

    try {
      const response = await postWithFallback("/api/check-user", {
        number: mobile,
      });

      if (response.data.exists) {
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOTP(newOTP);
        setOtpSent(true);
        setOtpToast(newOTP);
        setTimeout(() => setOtpToast(""), 20000);
      } else {
        setErrorMsg("Number not registered!");
        setTimeout(() => setErrorMsg(""), 5002);
      }
    } catch (err) {
      setErrorMsg("Server Error!");
      setTimeout(() => setErrorMsg(""), 5002);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp === generatedOTP) {
      try {
        const res = await postWithFallback("/api/login", {
          number: mobile,
        });

        if (res.data.success) {
          await save({ name: res.data.user.name, role: "patient", userId: res.data.user._id }, passwordEncrypted);
          navigate("/patient-dashboard");
        }
      } catch (err) {
        setErrorMsg("Login failed!");
        setTimeout(() => setErrorMsg(""), 5002);
      }
    } else {
      setInvalidOtp("Invalid OTP");
      setTimeout(() => setInvalidOtp(""), 5002);
    }
  };

  return (
    <div className="mediq-v3-root">
      <div className="login-toast-stack">
        {otpToast && (
          <div className="adm-notification-toast toast-info login-toast-primary">
            <Info size={24} />
            <div className="adm-toast-body">
              <div className="login-toast-label">
                OTP Given Below:
              </div>
              <div className="otp-display-text">
                {otpToast}
              </div>
            </div>
            <X
              size={18}
              onClick={() => setOtpToast("")}
              className="login-toast-close"
            />
            <div className="toast-timer-line run-20s"></div>
          </div>
        )}

        {(invalidOtp || errorMsg) && (
          <div
            className={`adm-notification-toast toast-error login-toast-secondary ${
              otpToast ? "with-otp-toast" : ""
            }`}
          >
            <AlertCircle size={24} />
            <div className="login-toast-body-grow">
              <strong className="login-toast-title">Alert</strong>
              <span>{invalidOtp || errorMsg}</span>
            </div>
            <X
              size={18}
              onClick={() => {
                setInvalidOtp("");
                setErrorMsg("");
              }}
              className="login-toast-close"
            />
            <div className="toast-timer-line run-5s"></div>
          </div>
        )}
      </div>

      <div className="mediq-v3-card">
        <div className="login-header">
          <ShieldCheck size={55} color="#1A1F2C" className="login-header-icon" />
          <h1 className="mediq-v3-title">Patient Portal</h1>
          <p className="mediq-v3-subtext">Secure Healthcare Access</p>
        </div>

        <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
          <div className="mediq-v3-input-group">
            <label className="mediq-v3-label">Mobile Number</label>
            <input
              className="mediq-v3-input"
              type="text"
              placeholder="8070605040"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              maxLength="10"
              required
              disabled={otpSent}
            />
          </div>

          {otpSent && (
            <div className="mediq-v3-input-group">
              <label className="mediq-v3-label">Enter OTP</label>
              <input
                className="mediq-v3-input"
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength="6"
                required
              />
            </div>
          )}

          <button type="submit" className="mediq-v3-submit-btn">
            {otpSent ? "Login to Portal ->" : "Send OTP ->"}
          </button>
        </form>

        <div className="mediq-v3-footer">
          New Patient?{" "}
          <span onClick={() => navigate("/register")} className="mediq-v3-link">
            Register Here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;

