import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  Stethoscope,
  CheckCircle,
  Clock,
  User,
  Sun,
  Moon,
  AlertCircle,
  X,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Appointments.css";
import { useAuthUser } from "../../Services/useAuthUser";

const Appointments = () => {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isBooked, setIsBooked] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    department: "",
    doctor: "",
    doctorId: "",
    appointmentDate: "",
    timeSlot: "",
    shift: "Day",
    fee: 0,
  });

  

  useEffect(() => {
    const userId = user?.userId || null;

    if (userId) {
      axios
        .get(`http://localhost:5000/api/patients/${userId}`)
        .then((res) => {
          console.log("Patient data loaded:", res.data);
          setFormData((prev) => ({
            ...prev,
            patientId: userId,
            patientName: res.data.name || "",
            patientEmail: res.data.email || "",
            patientPhone: res.data.number || "",
          }));
        })
        .catch((err) => {
          console.error("Profile Fetch Error:", err);
          setLoadError("Failed to load patient profile.");
        });
    }

    axios
      .get("http://localhost:5000/api/doctors/all?summary=1")
      .then((res) => {
        console.log("Doctors loaded:", res.data);
        if (res.data.doctors) {
          setDoctorsList(res.data.doctors.filter((d) => d.status === "Active"));
        } else if (Array.isArray(res.data)) {
          setDoctorsList(res.data.filter((d) => d.status === "Active"));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Doctors Fetch Error:", err);
        setLoadError("Failed to load doctors list.");
        setLoading(false);
      });
  }, [user]);

  const showToastMsg = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      5002,
    );
  };

  const departments = useMemo(
    () => Array.from(new Set(doctorsList.map((d) => d.specialization))).sort(),
    [doctorsList],
  );

  const filteredDoctors = useMemo(() => {
    return doctorsList.filter(
      (doc) =>
        doc.specialization === formData.department &&
        doc.shift === formData.shift,
    );
  }, [doctorsList, formData.department, formData.shift]);

  const availableSlots =
    formData.shift === "Day"
      ? [
        "09:00 AM",
        "11:00 AM",
        "01:00 PM",
        "03:00 PM",
        "05:00 PM",
        "07:00 PM",
        "09:00 PM",
      ]
      : [
        "09:00 PM",
        "11:00 PM",
        "01:00 AM",
        "03:00 AM",
        "05:00 AM",
        "07:00 AM",
        "09:00 AM",
      ];

  const handleDoctorSelect = (doc) => {
    setFormData((prev) => ({
      ...prev,
      doctor: doc.fullName,
      doctorId: doc._id,
      fee: doc.consultationFee || 500,
      timeSlot: "",
    }));
  };

  const handleShiftChange = (newShift) => {
    setFormData({
      ...formData,
      shift: newShift,
      doctor: "",
      doctorId: "",
      timeSlot: "",
    });
  };

  const confirmBooking = async () => {
    if (!formData.doctorId || !formData.appointmentDate || !formData.timeSlot) {
      alert("Please select all fields!");
      return;
    }

    if (!formData.patientId) {
      alert("Patient ID not found. Please login again.");
      return;
    }

    if (!formData.patientName) {
      alert("Patient name not loaded. Please try refreshing the page.");
      return;
    }

    try {
      console.log("Booking Data:", formData);

      const res = await axios.post(
        "http://localhost:5000/api/appointments/book",
        formData,
      );
      if (res.status === 201) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        showToastMsg("Appointment booked successfully!");
        setIsBooked(true);
        setTimeout(() => navigate("/patient-dashboard"), 2500);
      }
    } catch (err) {
      console.error("Booking Error Details:", err.response?.data);
      const errorMessage = err.response?.data?.message || "Booking failed!";
      alert(`${errorMessage} Make sure all fields are properly filled.`);
    }
  };

  if (loading)
    return <div className="ap-loading">Loading Appointment Portal...</div>;

  if (loadError) {
    return (
      <div className="ap-main-wrapper">
        <div className="ap-container">
          <div className="ap-card ap-error-card">
            <h2>Error Loading Page</h2>
            <p>{loadError}</p>
            <p>Please refresh the page or login again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="ap-main-wrapper">
        {toast.show && (
          <div
            className={`ap-toast ${toast.type === "error" ? "ap-toast-error" : "ap-toast-success"}`}
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
            <X
              size={16}
              onClick={() => setToast({ ...toast, show: false })}
              className="ap-toast-close"
            />
            <div className="ap-toast-timer ap-run-5s"></div>
          </div>
        )}
        <div className="ap-container ap-success-box">
          <CheckCircle size={80} color="#22c55e" className="ap-success-icon" />
          <h2 className="ap-bold-text">
            Payment Successful & Booking Confirmed!
          </h2>
          <p className="ap-bold-text">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-main-wrapper">
      <div className="ap-container">
        <div className="ap-card">
          <h2 className="ap-main-title">
            <Stethoscope size={26} /> Complete Appointment Form
          </h2>

          {doctorsList.length === 0 && (
            <div className="ap-alert-box ap-alert-warning">
              <AlertCircle size={16} /> No doctors available in the system yet. Please try again later.
            </div>
          )}

          {formData.patientName && (
            <div className="ap-alert-box ap-alert-success">
              <CheckCircle size={16} /> Logged in as: <strong>{formData.patientName}</strong>
            </div>
          )}

          <div className="ap-form-single-page">
            <div className="ap-section-group">
              <label className="ap-label">1. Choose speciality</label>
              <select
                className="ap-input"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value,
                    doctor: "",
                    doctorId: "",
                  })
                }
              >
                <option value="">-- Select speciality --</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="ap-section-group">
              <label className="ap-label">2. Preferred Shift</label>
              <div className="ap-shift-container">
                <button
                  className={`ap-shift-toggle-btn ${formData.shift === "Day" ? "active-day" : ""}`}
                  onClick={() => handleShiftChange("Day")}
                >
                  <Sun size={18} /> Day (9AM - 9PM)
                </button>
                <button
                  className={`ap-shift-toggle-btn ${formData.shift === "Night" ? "active-night" : ""}`}
                  onClick={() => handleShiftChange("Night")}
                >
                  <Moon size={18} /> Night (9PM - 9AM)
                </button>
              </div>
            </div>
            <div className="ap-section-group">
              <label className="ap-label">
                3. Select Available Doctor ({formData.shift} Shift)
              </label>
              <div className="ap-doctor-scroll-grid">
                {formData.department ? (
                  filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <div
                        key={doc._id}
                        className={`ap-doctor-badge-card ${formData.doctor === doc.fullName ? "selected" : ""}`}
                        onClick={() => handleDoctorSelect(doc)}
                      >
                        <div className="ap-badge-header">
                          <span
                            className={`ap-shift-badge ${doc.shift === "Day" ? "day" : "night"}`}
                          >
                            {doc.shift} Specialist
                          </span>
                        </div>
                        <div className="ap-doc-main-info">
                          <User size={24} />
                          <div className="ap-doc-text-block">
                            <b className="ap-doc-name-text">{doc.fullName}</b>
                            <p className="ap-doc-fee-text">
                              Fee: <IndianRupee size={14} />{doc.consultationFee || 500}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="ap-info-text">
                      No doctors available for this shift.
                    </p>
                  )
                ) : (
                  <p className="ap-info-text">Select a speciality first.</p>
                )}
              </div>
            </div>
            <div className="ap-grid-layout">
              <div className="ap-section-group">
                <label className="ap-label">4. Pick Date</label>
                <input
                  type="date"
                  className="ap-input"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="ap-section-group">
                <label className="ap-label">5. Available Slots</label>
                <div className="ap-slot-pill-grid">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      className={`ap-time-pill ${formData.timeSlot === slot ? "active" : ""}`}
                      onClick={() =>
                        setFormData({ ...formData, timeSlot: slot })
                      }
                    >
                      <Clock size={14} /> {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="ap-final-action-zone">
              <div className="ap-confirm-summary">
                <p>
                  <b>Patient:</b> {formData.patientName}
                </p>
                <p>
                  <b>Doctor:</b> {formData.doctor || "None"}
                </p>
                <h3 className="ap-payable-amount">
                  Amount Payable: <IndianRupee size={16} />{formData.fee}
                </h3>
              </div>
              <button
                className="ap-final-book-btn"
                onClick={confirmBooking}
                disabled={!formData.timeSlot || !formData.doctor}
              >
                Pay <IndianRupee size={16} />{formData.fee} & Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
