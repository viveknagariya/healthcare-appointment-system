import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Camera,
  Eye,
  EyeOff,
  Clock,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Lock,
  FileText,
  UploadCloud,
  CheckCircle,
  Calendar,
  Award,
  GraduationCap,
  Building2,
  FileUser,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import "./DoctorRegister.css";

const V_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Mizoram",
  "Nagaland",
  "Orissa",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Kerala",
  "Tripura",
  "Uttarakhand",
  "Uttar Pradesh",
  "West Bengal",
];

const DEGREE_MAPPING = {
  Neurologist: ["MD (General Medicine) + DM (Neurology)", "DNB (Neurology)"],
  Psychiatrist: ["MD (Psychiatry)", "DPM (Diploma)", "DNB (Psychiatry)"],
  Ophthalmologist: ["MS (Ophthalmology)", "DOMS", "DNB (Ophthalmology)"],
  Dentist: ["BDS", "MDS"],
  ENT: ["MS (ENT)", "DLO (Diploma)", "DNB (ENT)"],
  Cardiologist: ["MD (General Medicine) + DM (Cardiology)", "DNB (Cardiology)"],
  Pulmonologist: ["MD (Pulmonary Medicine)", "DTCD", "DNB (Pulmonology)"],
  Gastroenterologist: ["MD (General Medicine) + DM (Gastroenterology)"],
  Nephrologist: ["MD (General Medicine) + DM (Nephrology)"],
  Endocrinologist: ["MD (General Medicine) + DM (Endocrinology)"],
  Orthopedic: ["MS (Orthopedics)", "D-Ortho", "DNB (Orthopedics)"],
  Rheumatologist: ["MD (Medicine) + DM (Rheumatology)"],
  Physiotherapist: ["BPT", "MPT"],
  Dermatologist: ["MD (Dermatology)", "DDVL", "DNB (Dermatology)"],
  Hematologist: ["MD (Medicine/Pathology) + DM (Hematology)"],
  Gynecologist: ["MS (Obstetrics & Gynecology)", "DGO", "DNB (OBG)"],
  Urologist: ["MS (General Surgery) + MCh (Urology)"],
  Pediatrician: ["MD (Pediatrics)", "DCH", "DNB (Pediatrics)"],
  Geriatrician: ["MD (Geriatric Medicine)", "MD (General Medicine)"],
  Oncologist: [
    "MD (Radiotherapy)",
    "DM (Medical Oncology)",
    "MCh (Surgical Oncology)",
  ],
  GeneralPhysician: ["MBBS", "MD (General Medicine)"],
  GeneralSurgeon: ["MS (General Surgery)", "DNB (General Surgery)"],
  Hepatologist: [
    "MD (General Medicine) + DM (Hepatology)",
    "DNB (Gastroenterology/Hepatology)",
  ],
  Podiatrist: [
    "DPM (Podiatric Medicine)",
    "MS (General Surgery) + Podiatry Fellowship",
  ],
};

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    specialization: "",
    degree: "",
    experience: "",
    shift: "Day",
    state: "",
    regNo: "",
    regCouncil: "",
    currentWork: "",
    password: "",
    confirmPassword: "",
  });

  const [files, setFiles] = useState({
    profileImg: null,
    degreeDoc: null,
    idProof: null,
    regDoc: null,
    cvDoc: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const val = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, [name]: val });
      return;
    }
    if (name === "experience" && value < 0) {
      setForm({ ...form, [name]: 0 });
      return;
    }
    if (name === "specialization") {
      setForm({ ...form, [name]: value, degree: "" });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleFile = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles({ ...files, [key]: file });
    if (key === "profileImg") setPreview(URL.createObjectURL(file));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (form.phone.length !== 10) {
      setErrorToast("Enter 10-digit number.");
      setTimeout(() => setErrorToast(""), 5002);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorToast("Passwords mismatch.");
      setTimeout(() => setErrorToast(""), 5002);
      return;
    }
    if (
      !files.profileImg ||
      !files.degreeDoc ||
      !files.idProof ||
      !files.regDoc ||
      !files.cvDoc
    ) {
      setErrorToast("Please upload all 5 required documents.");
      setTimeout(() => setErrorToast(""), 5002);
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("fullName", form.fullName);
      data.append("email", form.email);
      data.append("phone", form.phone);
      data.append("gender", form.gender);
      data.append("address", form.state);
      data.append("regCouncil", form.regCouncil);
      data.append("regNumber", form.regNo);
      data.append("password", form.password);
      data.append("dob", form.dob);
      data.append("specialization", form.specialization);
      data.append("qualification", form.degree);
      data.append("experienceYears", form.experience);
      data.append("currentWorkplace", form.currentWork);
      data.append("shift", form.shift);
      data.append("profileImg", files.profileImg);
      data.append("degreeDoc", files.degreeDoc);
      data.append("idProof", files.idProof);
      data.append("regDoc", files.regDoc);
      data.append("cvDoc", files.cvDoc);

      const res = await axios.post(
        "http://localhost:5000/api/doctors/register",
        data,
      );
      if (res.data.success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          navigate("/doctor-login");
        }, 5002);
      } else {
        setErrorToast(res.data.message);
        setTimeout(() => setErrorToast(""), 5002);
      }
    } catch (err) {
      setErrorToast(err.response?.data?.message || "Registration failed.");
      setTimeout(() => setErrorToast(""), 5002);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="v-dr-reg-container">
      {errorToast && (
        <div className="adm-notification-toast error-variant">
          <AlertCircle size={20} />
          <div>
            <strong>Error:</strong> {errorToast}
          </div>
          <X
            size={16}
            onClick={() => setErrorToast("")}
            className="adm-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      {showSuccessToast && (
        <div className="adm-notification-toast success-variant">
          <CheckCircle size={20} />
          <div>
            <strong>Success:</strong> Doctor Registered! Wait for Admin
            Approval.
          </div>
          <X
            size={16}
            onClick={() => setShowSuccessToast(false)}
            className="adm-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <div className="v-dr-reg-card">
        <header className="v-dr-reg-header">
          <ShieldCheck size={48} className="v-dr-main-icon" />
          <h1>MediQ Portal</h1>
          <p>Doctor Professional Registration</p>
        </header>

        <form onSubmit={submitForm} className="v-dr-reg-form">
          <div className="v-dr-photo-wrapper">
            <label className="v-dr-photo-label">
              <div className="v-dr-avatar-box">
                {preview ? (
                  <img src={preview} alt="profile" />
                ) : (
                  <User size={45} color="#ccc" />
                )}
                <div className="v-dr-cam-icon">
                  <Camera size={18} />
                </div>
              </div>
              <input
                type="file"
                hidden
                accept="image/*"
                required
                onChange={(e) => handleFile(e, "profileImg")}
              />
              <div className="v-dr-photo-text">
                <span>Upload Profile Photo *</span>
                <small>Professional headshot</small>
              </div>
            </label>
          </div>

          <div className="v-dr-form-grid">
            <div className="v-dr-input-group">
              <label className="v-dr-label">Doctor Shift</label>
              <div className="v-dr-field-wrap">
                <Clock size={18} className="v-dr-inner-icon-left" />
                <select
                  name="shift"
                  className="v-dr-input"
                  value={form.shift}
                  onChange={handleChange}
                  required
                >
                  <option value="Day">Day Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Full Name</label>
              <div className="v-dr-field-wrap">
                <User size={18} className="v-dr-inner-icon-left" />
                <input
                  name="fullName"
                  className="v-dr-input"
                  placeholder="Dr. Vivek Parmar"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Phone Number</label>
              <div className="v-dr-field-wrap">
                <Phone size={18} className="v-dr-inner-icon-left" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  className="v-dr-input"
                  placeholder="Enter 10 digit number"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Date of Birth</label>
              <div className="v-dr-field-wrap">
                <Calendar size={18} className="v-dr-inner-icon-left" />
                <input
                  type="date"
                  name="dob"
                  className="v-dr-input"
                  placeholder="Select your date of birth"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Email Address</label>
              <div className="v-dr-field-wrap">
                <Mail size={18} className="v-dr-inner-icon-left" />
                <input
                  type="email"
                  name="email"
                  className="v-dr-input"
                  placeholder="example@clinic.com"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Gender</label>
              <div className="v-dr-gender-row">
                <div className="v-dr-radio-options">
                  <label className="v-dr-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={form.gender === "Male"}
                      onChange={handleChange}
                    />
                    <span>Male</span>
                  </label>
                  <label className="v-dr-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={form.gender === "Female"}
                      onChange={handleChange}
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Specialization</label>
              <div className="v-dr-field-wrap">
                <Briefcase size={18} className="v-dr-inner-icon-left" />
                <select
                  name="specialization"
                  className="v-dr-input"
                  required
                  onChange={handleChange}
                  value={form.specialization}
                >
                  <option value="">Select speciality</option>
                  {Object.keys(DEGREE_MAPPING)
                    .sort()
                    .map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Medical Degree</label>
              <div className="v-dr-field-wrap">
                <GraduationCap size={18} className="v-dr-inner-icon-left" />
                <select
                  name="degree"
                  className="v-dr-input"
                  required
                  onChange={handleChange}
                  disabled={!form.specialization}
                  value={form.degree}
                >
                  <option value="">Select Degree</option>
                  {form.specialization &&
                    DEGREE_MAPPING[form.specialization].map((deg) => (
                      <option key={deg} value={deg}>
                        {deg}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Experience (Years)</label>
              <div className="v-dr-field-wrap">
                <Clock size={18} className="v-dr-inner-icon-left" />
                <input
                  type="number"
                  name="experience"
                  className="v-dr-input"
                  placeholder="Enter total years of experience"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Current Workplace</label>
              <div className="v-dr-field-wrap">
                <Building2 size={18} className="v-dr-inner-icon-left" />
                <input
                  name="currentWork"
                  className="v-dr-input"
                  placeholder="Enter current hospital or clinic name"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">State</label>
              <div className="v-dr-field-wrap">
                <MapPin size={18} className="v-dr-inner-icon-left" />
                <select
                  name="state"
                  className="v-dr-input"
                  required
                  onChange={handleChange}
                >
                  <option value="">Choose State</option>
                  {V_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Registration No.</label>
              <div className="v-dr-field-wrap">
                <ShieldCheck size={18} className="v-dr-inner-icon-left" />
                <input
                  name="regNo"
                  className="v-dr-input"
                  placeholder="Enter medical registration number"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Medical Council</label>
              <div className="v-dr-field-wrap">
                <Award size={18} className="v-dr-inner-icon-left" />
                <select
                  name="regCouncil"
                  className="v-dr-input"
                  required
                  onChange={handleChange}
                >
                  <option value="">Select Council</option>
                  <option value="SMC">State Medical Council (SMC)</option>
                  <option value="NMC">National Medical Council (NMC)</option>
                </select>
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Password</label>
              <div className="v-dr-field-wrap">
                <Lock size={18} className="v-dr-inner-icon-left" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  className="v-dr-input v-dr-pass-input"
                  placeholder="Enter your password"
                  required
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="v-dr-eye-btn"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="v-dr-input-group">
              <label className="v-dr-label">Confirm Password</label>
              <div className="v-dr-field-wrap">
                <CheckCircle size={18} className="v-dr-inner-icon-left" />
                <input
                  type={showPass ? "text" : "password"}
                  name="confirmPassword"
                  className="v-dr-input"
                  placeholder="Confirm password"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="v-dr-docs-section">
            <h3>Verification Documents</h3>
            <div className="v-dr-docs-grid">
              {[
                {
                  key: "degreeDoc",
                  title: "Degree Certificate",
                  icon: <FileText size={28} />,
                },
                {
                  key: "idProof",
                  title: "ID Proof (Aadhar/Pan)",
                  icon: <User size={28} />,
                },
                {
                  key: "regDoc",
                  title: "Registration Cert.",
                  icon: <UploadCloud size={28} />,
                },
                {
                  key: "cvDoc",
                  title: "Medical CV / Resume",
                  icon: <FileUser size={28} />,
                },
              ].map((doc) => (
                <label
                  key={doc.key}
                  className={`v-dr-doc-card ${files[doc.key] ? "v-active" : ""}`}
                >
                  <input
                    type="file"
                    hidden
                    required
                    onChange={(e) => handleFile(e, doc.key)}
                  />
                  <div className="v-dr-doc-icon-box">{doc.icon}</div>
                  <div className="v-dr-doc-info">
                    <span className="v-dr-doc-title">{doc.title}</span>
                    <span className="v-dr-doc-status">
                      {files[doc.key] ? <>File Selected <CheckCircle size={14} /></> : "Click to Upload"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="v-dr-submit-btn" disabled={loading}>
            {loading ? "Registering..." : <>Complete Registration <ArrowRight size={16} /></>}
          </button>
        </form>

        <footer className="v-dr-footer">
          <p className="adm-register-option">
            Already have an account?{" "}
            <Link to="/doctor-login" className="adm-register-link">
              Login here
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DoctorRegister;
