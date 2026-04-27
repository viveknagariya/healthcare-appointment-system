import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Camera,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import "../Auth/Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    gender: "Male",
  });

  useEffect(() => {
    if (errorMsg || showToast) {
      const timer = setTimeout(() => {
        setErrorMsg("");
        setShowToast(false);
      }, 5002);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, showToast]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please upload a profile photo.");
      return;
    }
    if (formData.number.length !== 10) {
      setErrorMsg("Enter 10-digit number.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("number", formData.number);
      data.append("gender", formData.gender);
      data.append("profilePic", selectedFile);

      const response = await axios.post(
        "http://localhost:5000/api/register",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setShowToast(true);
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {errorMsg && (
        <div className="adm-notification-toast toast-error">
          <AlertCircle size={20} />
          <div className="adm-toast-body">
            <strong>ERROR: </strong> {errorMsg}
          </div>
          <X
            size={16}
            onClick={() => setErrorMsg("")}
            className="register-toast-close"
          />
        </div>
      )}

      {showToast && (
        <div className="adm-notification-toast toast-success">
          <CheckCircle size={20} />
          <div className="adm-toast-body">
            <strong>SUCCESS: </strong> Registered Successfully!
          </div>
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <div className="auth-card">
        <div className="register-header">
          <ShieldCheck size={55} color="#1A1F2C" className="register-header-icon" />
          <h1 className="auth-title">Patient Registration</h1>
          <p className="auth-subtext">Create your health account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="reg-profile-upload-container">
            <label
              htmlFor="regImageUpload"
              className="reg-image-upload-wrapper"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="reg-image-preview"
                />
              ) : (
                <div className="reg-upload-placeholder">
                  <Camera size={26} />
                  <span>UPLOAD</span>
                </div>
              )}
            </label>
            <input
              type="file"
              id="regImageUpload"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="input-field">
            <label className="reg-label">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="input-field">
            <label className="reg-label">Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              required
              maxLength="10"
              value={formData.number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  number: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>

          <div className="gender-section">
            <label className="reg-label">Gender</label>
            <div className="reg-gender-selection-row">
              {["Male", "Female"].map((g) => (
                <label key={g} className="reg-radio-item">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  />
                  <span className="reg-radio-label-text">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Creating Account..." : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="reg-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
