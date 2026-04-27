import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  UserCircle as CircleUser,
  ExternalLink,
  Clock,
  Building2,
  X as XIcon,
  Edit2,
  Check,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import "./Profile.css";
import { useAuthUser } from "../../Services/useAuthUser";

const Profile = () => {
  const { user } = useAuthUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [showPass, setShowPass] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const BASE_URL = "http://localhost:5000";

  const getAssetUrl = (filePath) => {
    if (!filePath) return "";
    const normalizedPath = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
    return `${BASE_URL}/${normalizedPath}`;
  };

  useEffect(() => {
    if (user != null) {
      const userId = user?.userId || null;
      if (userId) {

        const fetchProfile = async () => {
          try {
            const res = await axios.get(
              `${BASE_URL}/api/doctors/profile/${userId}`,
            );
            setProfile(res.data);
            setTempProfile({ ...res.data, password: "", confirmPassword: "" });
            setImageLoadFailed(false);
            setLoading(false);
          } catch (err) {
            console.log(err);
            setLoading(false);
          }
        };

        fetchProfile();
      }
    }
  }, [user]);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5002);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (tempProfile.phone && (!/^\d{10}$/.test(tempProfile.phone))) {
      showNotification("Please enter a valid 10-digit phone number", "error");
      return;
    }

    if (tempProfile.password || tempProfile.confirmPassword) {
      if (tempProfile.password !== tempProfile.confirmPassword) {
        showNotification("Passwords do not match!", "error");
        return;
      }
    }

    try {
      const payload = {
        fullName: tempProfile.fullName,
        email: tempProfile.email,
        phone: tempProfile.phone,
        dob: tempProfile.dob,
        specialization: tempProfile.specialization,
        experienceYears: tempProfile.experienceYears,
        qualification: tempProfile.qualification,
        currentWorkplace: tempProfile.currentWorkplace,
        regNumber: tempProfile.regNumber,
        address: tempProfile.address,
        isFromPortal: true,
      };

      if (tempProfile.password) {
        payload.password = tempProfile.password;
      }

      const res = await axios.put(
        `${BASE_URL}/api/doctors/update/${user?.userId}`,
        payload
      );

      if (res.data.success) {
        setProfile(res.data.doctor);
        setTempProfile({
          ...res.data.doctor,
          password: "",
          confirmPassword: "",
        });
        setIsEditing(false);
        showNotification("Profile Updated Successfully! Status reverted to Pending for re-verification.");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Update Failed!", "error");
    }
  };

  if (loading) return <div className="v-dr-prof-loading">Loading Professional Profile...</div>;
  if (!profile) return <div className="v-dr-prof-error">Profile not found.</div>;

  return (
    <div className="v-dr-prof-wrapper">
      {toast.show && (
        <div
          className={`adm-notification-toast ${toast.type === "success"
              ? "success-variant"
              : "error-variant"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <div>
            <strong>{toast.type === "success" ? "Success:" : "Error:"}</strong>{" "}
            {toast.message}
          </div>
          <XIcon
            size={16}
            onClick={() => setToast({ show: false, message: "", type: "success" })}
            className="adm-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <div className="v-dr-prof-header-bg"></div>

      <div className="v-dr-prof-main">
        <div className="v-dr-prof-container">
          <div className="v-dr-prof-sidebar">
            <div className="v-dr-prof-photo-card">
              <div className="v-dr-prof-avatar-wrap">
                {profile.image && !imageLoadFailed ? (
                  <img
                    src={getAssetUrl(profile.image)}
                    alt="Profile"
                    className="v-dr-prof-img"
                    onError={() => setImageLoadFailed(true)}
                  />
                ) : (
                  <CircleUser size={120} color="#ccc" />
                )}
              </div>
              <h2 className="v-dr-prof-name">{profile.fullName}</h2>
              <span className="v-dr-prof-spec-tag">{profile.specialization}</span>
              <div className="v-dr-prof-status-badge">
                <ShieldCheck size={14} /> {profile.status}
              </div>
            </div>

            <div className="v-dr-prof-action-card">
              {!isEditing ? (
                <button
                  className="v-dr-prof-btn-edit"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <div className="v-dr-prof-edit-actions">
                  <button className="v-dr-prof-btn-save" onClick={handleUpdate}>
                    <Check size={16} /> Update Data
                  </button>
                  <button
                    className="v-dr-prof-btn-cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setTempProfile(profile);
                    }}
                  >
                    <XIcon size={16} /> Discard
                  </button>
                </div>
              )}
            </div>

            <div className="v-dr-prof-shift-card">
              <Clock size={20} />
              <span>
                <strong>Reference ID:</strong> {profile._id.slice(-6)}
              </span>
            </div>
          </div>

          <div className="v-dr-prof-content">
            <div className={`v-dr-prof-section-card ${isEditing ? "editing-mode" : ""}`}>
              <h3 className="v-dr-prof-sec-title">Personal Information</h3>
              <div className="v-dr-prof-grid">
                <div className="v-dr-prof-info-box">
                  <User size={18} />
                  <div>
                    <span>Full Name</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        name="fullName"
                        value={tempProfile.fullName || ""}
                        placeholder="Enter your full name"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{profile.fullName}</p>
                    )}
                  </div>
                </div>
                <div className="v-dr-prof-info-box">
                  <Mail size={18} />
                  <div>
                    <span>Email Address</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        name="email"
                        value={tempProfile.email || ""}
                        placeholder="Enter your professional email"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{profile.email}</p>
                    )}
                  </div>
                </div>
                <div className="v-dr-prof-info-box">
                  <Phone size={18} />
                  <div>
                    <span>Phone Number</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        name="phone"
                        value={tempProfile.phone || ""}
                        placeholder="Enter your 10-digit phone number"
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setTempProfile({ ...tempProfile, phone: val });
                        }}
                      />
                    ) : (
                      <p>{profile.phone}</p>
                    )}
                  </div>
                </div>
                <div className="v-dr-prof-info-box">
                  <Calendar size={18} />
                  <div>
                    <span>Date of Birth</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        type="date"
                        name="dob"
                        value={tempProfile.dob ? new Date(tempProfile.dob).toISOString().split("T")[0] : ""}
                        placeholder="Select your date of birth"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{new Date(profile.dob).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="v-dr-prof-section-card">
              <h3 className="v-dr-prof-sec-title">Professional Background</h3>
              <div className="v-dr-prof-grid">
                <div className="v-dr-prof-info-box">
                  <Briefcase size={18} />
                  <div>
                    <span>Specialization</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        name="specialization"
                        value={tempProfile.specialization || ""}
                        placeholder="Enter your specialization"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{profile.specialization}</p>
                    )}
                  </div>
                </div>
                <div className="v-dr-prof-info-box">
                  <Clock size={18} />
                  <div>
                    <span>Experience</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        type="number"
                        name="experienceYears"
                        value={tempProfile.experienceYears || ""}
                        placeholder="Enter years of experience"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{profile.experienceYears} Years</p>
                    )}
                  </div>
                </div>
                <div className="v-dr-prof-info-box">
                  <GraduationCap size={18} />
                  <div>
                    <span>Qualification</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        name="qualification"
                        value={tempProfile.qualification || ""}
                        placeholder="Enter your highest qualification"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{profile.qualification}</p>
                    )}
                  </div>
                </div>
                <div className="v-dr-prof-info-box">
                  <Building2 size={18} />
                  <div>
                    <span>Workplace</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        name="currentWorkplace"
                        value={tempProfile.currentWorkplace || ""}
                        placeholder="Enter your current workplace"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{profile.currentWorkplace}</p>
                    )}
                  </div>
                </div>
                <div className="v-dr-prof-info-box">
                  <ShieldCheck size={18} />
                  <div>
                    <span>Registration No.</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        name="regNumber"
                        value={tempProfile.regNumber || ""}
                        placeholder="Enter your registration number"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{profile.regNumber}</p>
                    )}
                  </div>
                </div>
                <div className="v-dr-prof-info-box">
                  <MapPin size={18} />
                  <div>
                    <span>Address</span>
                    {isEditing ? (
                      <input
                        className="v-dr-prof-input"
                        name="address"
                        value={tempProfile.address || ""}
                        placeholder="Enter your clinic or residence address"
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{profile.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="v-dr-prof-section-card">
                <h3 className="v-dr-prof-sec-title">Account Security</h3>
                <div className="v-dr-prof-grid">
                  <div className="v-dr-prof-info-box">
                    <Lock size={18} />
                    <div style={{ width: "100%" }}>
                      <span>Current Password</span>
                      <div className="v-dr-prof-pass-wrap">
                        <input
                          type="text"
                          value={profile.visiblePassword || "Please Re-login"}
                          readOnly
                          className="v-dr-prof-input"
                          style={{ color: "#059669", fontWeight: "700", background: "#f8fafc" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="v-dr-prof-info-box">
                    <Lock size={18} />
                    <div style={{ width: "100%" }}>
                      <span>New Password</span>
                      <div className="v-dr-prof-pass-wrap">
                        <input
                          type={showPass ? "text" : "password"}
                          name="password"
                          value={tempProfile.password || ""}
                          onChange={handleChange}
                          placeholder="Enter a new password"
                          className="v-dr-prof-input"
                          autoComplete="new-password"
                        />
                        <button
                          className="v-pass-toggle"
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                        >
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="v-dr-prof-info-box">
                    <Lock size={18} />
                    <div style={{ width: "100%" }}>
                      <span>Confirm New Password</span>
                      <div className="v-dr-prof-pass-wrap">
                        <input
                          type={showPass ? "text" : "password"}
                          name="confirmPassword"
                          value={tempProfile.confirmPassword || ""}
                          onChange={handleChange}
                          placeholder="Re-enter the new password"
                          className="v-dr-prof-input"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="v-dr-prof-section-card">
              <h3 className="v-dr-prof-sec-title">Verification Documents</h3>
              <div className="v-dr-prof-docs-list">
                {[
                  {
                    label: "Degree Certificate",
                    path: profile.degreeCertificate,
                  },
                  { label: "Identity Proof", path: profile.identityProof },
                  {
                    label: "Registration Certificate",
                    path: profile.registrationCertificate,
                  },
                  { label: "Medical CV", path: profile.cvFile },
                ].map((doc, idx) => (
                  <div key={idx} className="v-dr-prof-doc-item">
                    <FileText size={20} />
                    <span>{doc.label}</span>
                    <a
                      href={getAssetUrl(doc.path)}
                      target="_blank"
                      rel="noreferrer"
                      className="v-dr-prof-view-link"
                    >
                      View <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
