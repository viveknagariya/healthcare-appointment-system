import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, AlertCircle, X, ArrowRight } from "lucide-react";
import "./AdminLogin.css";
import { useEncryptedStorage, passwordEncrypted } from "../../Services/useEncryptedStorage";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
    }
    checkSession();
  }, [navigate, load]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        adminId,
        password,
      });

      if (res.data.success) {
        
        await save({ name: res.data.admin.name, role: "admin", userId: res.data.admin._id }, passwordEncrypted);
        navigate("/admin-dashboard");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Invalid Admin ID or Password!");
      }
      setTimeout(() => setError(""), 5002);
    }
  };

  return (
    <div className="adm-lp-wrapper">
      {error && (
        <div className="adm-lp-toast">
          <AlertCircle size={20} />
          <div className="adm-lp-toast-body">
            <strong>Error: </strong> {error}
          </div>
          <X
            size={16}
            onClick={() => setError("")}
            className="adm-lp-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}
      <div className="adm-lp-container">
        <div className="adm-lp-header">
          <ShieldCheck size={55} color="#1A1F2C" className="adm-lp-header-icon" />
          <h1 className="adm-lp-title">Admin Portal</h1>
          <p className="adm-lp-subtext">Secure Management Access</p>
        </div>
        <form onSubmit={handleAdminLogin}>
          <div className="adm-lp-input-group">
            <label className="adm-lp-label">Admin ID</label>
            <div className="adm-lp-control">
              <input
                type="text"
                placeholder="Enter Admin ID"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
              />
            </div>
          </div>
          <div className="adm-lp-input-group">
            <label className="adm-lp-label">Password</label>
            <div className="adm-lp-control">
              <input
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="adm-lp-submit-btn">
            Login to Dashboard <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminLogin;
