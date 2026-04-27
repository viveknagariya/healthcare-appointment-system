import React, { useState, useEffect } from "react";
import {
  Camera,
  Mail,
  User,
  Calendar,
  CheckCircle,
  Droplets,
  Scale,
  X,
  Phone,
  MapPin,
  Check,
  Edit2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import "./PatientProfile.css";
import { useAuthUser } from "../../Services/useAuthUser";

const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const { user } = useAuthUser();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    number: "",
    dob: "",
    gender: "Male",
    bloodGroup: "",
    address: "",
    weight: "",
    profilePic: "",
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    return `http://localhost:5000/${path}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user != null) {
        const userId = user?.userId || null;
        if (userId) {
          try {
            const res = await axios.get(`http://localhost:5000/api/patients/${userId}`);
            const fetchedData = {
              name: res.data.name || "",
              email: res.data.email || "",
              number: res.data.number || "",
              dob: res.data.dob || "",
              gender: res.data.gender || "Male",
              bloodGroup: res.data.bloodGroup || "",
              address: res.data.address || "",
              weight: res.data.weight || "",
              profilePic: res.data.profilePic || "",
            };
            setProfile(fetchedData);
            setTempProfile(fetchedData);
          } catch (err) {
            console.error("Fetch Error:", err);
          }
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const showToastMsg = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5002);
  };

  const handleChange = (e) => {
    setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const userId = user?.userId;
      const res = await axios.put(`http://localhost:5000/api/patients/${userId}`, tempProfile);
      if (res.data.success) {
        setProfile(tempProfile);
        setIsEditing(false);
        showToastMsg("Profile Updated Successfully!");
      }
    } catch (err) {
      showToastMsg("Update failed!", "error");
    }
  };

  if (loading) return <div className="pp-loading-screen">Loading Profile...</div>;

  return (
    <div className="pp-main-wrapper">
      {toast.show && (
        <div className={`adm-notification-toast ${toast.type === "error" ? "error-variant" : "success-variant"}`}>
          {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <div>
            <strong>{toast.type === "success" ? "Success:" : "Error:"}</strong> {toast.message}
          </div>
          <X
            size={16}
            onClick={() => setToast({ ...toast, show: false })}
            className="pp-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <div className="pp-content-container">
        <div className="pp-layout-grid">
          <div className="pp-sidebar-area">
            <div className="pp-photo-card">
              <div className="pp-avatar-frame">
                <img
                  src={getImageUrl(tempProfile.profilePic)}
                  alt="User"
                  className="pp-main-img"
                />
                {isEditing && (
                  <label className="pp-img-edit-icon">
                    <Camera size={16} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTempProfile({
                              ...tempProfile,
                              profilePic: reader.result,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <h2 className="pp-display-name">
                <b>{profile.name || "User Name"}</b>
              </h2>
              <p className="pp-status-badge">Verified Patient</p>
            </div>

            <div className="pp-action-control-box">
              {!isEditing ? (
                <button className="pp-btn-edit-start" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <div className="pp-edit-actions-grid">
                  <button className="pp-btn-save-mini" onClick={handleUpdate}>
                    <Check size={14} /> Update Data
                  </button>
                  <button
                    className="pp-btn-discard-mini"
                    onClick={() => {
                      setTempProfile({ ...profile });
                      setIsEditing(false);
                    }}
                  >
                    <X size={14} /> Discard
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pp-form-area">
            <div className="pp-data-card">
              <div className="pp-form-section">
                <h3 className="pp-section-head">
                  <User size={18} /> Personal Info
                </h3>
                <div className="pp-input-grid">
                  <div className="pp-field-group">
                    <label className="pp-field-label">Full Name</label>
                    <input
                      className="pp-field-input"
                      name="name"
                      value={tempProfile.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="pp-field-group">
                    <label className="pp-field-label">
                      <Calendar size={13} /> DOB
                    </label>
                    <input
                      className="pp-field-input"
                      type="date"
                      name="dob"
                      value={tempProfile.dob}
                      onChange={handleChange}
                      placeholder="Select your date of birth"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="pp-field-group">
                    <label className="pp-field-label">
                      <Droplets size={13} /> Blood Group
                    </label>
                    <input
                      className="pp-field-input"
                      name="bloodGroup"
                      value={tempProfile.bloodGroup}
                      onChange={handleChange}
                      placeholder="A+, B-"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="pp-field-group">
                    <label className="pp-field-label">
                      <Scale size={13} /> Weight (kg)
                    </label>
                    <input
                      className="pp-field-input"
                      name="weight"
                      value={tempProfile.weight}
                      onChange={handleChange}
                      placeholder="70"
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="pp-form-section">
                <h3 className="pp-section-head">
                  <Mail size={18} /> Contact Details
                </h3>
                <div className="pp-input-grid">
                  <div className="pp-field-group">
                    <label className="pp-field-label">Email ID</label>
                    <input
                      className="pp-field-input"
                      name="email"
                      value={tempProfile.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="pp-field-group">
                    <label className="pp-field-label">
                      <Phone size={13} /> Mobile
                    </label>
                    <input
                      className="pp-field-input"
                      name="number"
                      value={tempProfile.number}
                      onChange={handleChange}
                      placeholder="Enter your mobile number"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="pp-field-group pp-full-row">
                    <label className="pp-field-label">
                      <MapPin size={13} /> Home Address
                    </label>
                    <textarea
                      className="pp-field-input"
                      name="address"
                      value={tempProfile.address}
                      onChange={handleChange}
                      placeholder="Enter your full address"
                      rows="3"
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
