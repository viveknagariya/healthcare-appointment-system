import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Activity,
  ShieldCheck,
  Clock,
  User,
  Briefcase,
  GraduationCap,
  Eye,
  FileText,
  Building2,
  FileUser,
  Sun,
  Moon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./ManageDoctors.css";

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModal, setEditModal] = useState({ show: false, data: null });
  const [viewModal, setViewModal] = useState({ show: false, data: null });
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const backendBaseURL = "http://localhost:5000";

  const showNotification = useCallback((msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 5002);
  }, []);

  const getFileUrl = (doc, keyType) => {
    if (!doc) return "";
    let filePath = "";
    if (keyType === "image") filePath = doc.image || doc.profileImg;
    else if (keyType === "degree")
      filePath = doc.degreeCertificate || doc.degreeDoc;
    else if (keyType === "id") filePath = doc.identityProof || doc.idProof;
    else if (keyType === "reg")
      filePath = doc.registrationCertificate || doc.regDoc;
    else if (keyType === "cv") filePath = doc.cvFile || doc.cvDoc;

    if (!filePath) return "";
    const cleanPath = filePath.replace(/\\/g, "/");
    return `${backendBaseURL}/${cleanPath}`;
  };

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendBaseURL}/api/doctors/admin/all`);
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      showNotification("Critical: Database sync lost.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(
        `${backendBaseURL}/api/doctors/approve/${id}`,
      );
      if (res.data.success) {
        showNotification("Doctor Approved Successfully!", "green");
        fetchDoctors();
      }
    } catch (err) {
      showNotification("Approval failed.", "error");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${backendBaseURL}/api/doctors/update/${editModal.data._id}`,
        editModal.data,
      );
      if (res.data.success) {
        setEditModal({ show: false, data: null });
        showNotification("Record updated successfully!", "green");
        fetchDoctors();
      }
    } catch (error) {
      showNotification("Update failed.", "error");
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const res = await axios.delete(
        `${backendBaseURL}/api/doctors/delete/${doctorId}`,
      );
      if (res.data.success) {
        showNotification("Doctor deleted successfully", "green");
        fetchDoctors();
      }
    } catch (error) {
      showNotification("Delete failed", "error");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MediQ Professional Doctor List", 14, 20);

    const dataToExport = activeTab === "active" ? activeDocs : pendingDocs;

    const tableColumn = [
      "Name",
      "Specialization",
      "Shift",
      "Workplace",
      "Status",
    ];
    const tableRows = dataToExport.map((d) => [
      d.fullName,
      d.specialization,
      d.shift,
      d.currentWorkplace || "N/A",
      d.status,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [11, 31, 92] },
    });

    doc.save(`Doctor_Report_${activeTab}.pdf`);
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, doctors]);

  const pendingDocs = filteredDoctors.filter((d) => d.status === "Pending");
  const activeDocs = filteredDoctors.filter(
    (d) => d.status === "Active" || d.status === "Approved",
  );

  return (
    <div className="mediq-admin-portal">
      {toast.show && (
        <div className={`mediq-popup toast-type-${toast.type}`}>
          <div className="popup-inner">
            <div className="popup-icon">
              {toast.type === "green" ? (
                <CheckCircle size={22} />
              ) : (
                <AlertTriangle size={22} />
              )}
            </div>
            <div className="popup-content">
              <span className="popup-status">
                {toast.type === "green" ? "SUCCESS" : "DATABASE ALERT"}
              </span>
              <p className="popup-text">{toast.msg}</p>
            </div>
            <button
              className="popup-close"
              onClick={() => setToast({ ...toast, show: false })}
            >
              <X size={16} />
            </button>
          </div>
          <div className="popup-timer-line"></div>
        </div>
      )}

      <div className="mediq-admin-content">
        <header className="portal-header-card">
          <div className="header-main-info">
            <div className="portal-icon-box">
              <Stethoscope size={36} color="#1A1F2C" />
            </div>
            <div className="portal-text-box">
              <h1>Manage Doctors</h1>
              <div className="portal-badges">
                <span className="badge-count">Total: {doctors.length}</span>
                <span className="badge-live">
                  <Activity size={14} /> Live Sync
                </span>
              </div>
            </div>
          </div>
          <div className="header-actions-bar">
            <div className="portal-search">
              <Search size={20} className="search-icon-fixed" />
              <input
                type="text"
                placeholder="Find doctor by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="doctor-master-blue-btn"
              onClick={handleDownloadPDF}
            >
              <FileText size={20} /> Download PDF
            </button>
          </div>
        </header>

        <div className="v-tab-container">
          <button
            className={`v-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <ShieldCheck size={16} /> Verified ({activeDocs.length})
          </button>
          <button
            className={`v-tab ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            <Clock size={16} /> Pending ({pendingDocs.length})
          </button>
        </div>

        <div className="portal-table-wrapper">
          <table className="portal-main-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Full Name</th>
                <th>Specialization</th>
                <th>Shift</th>
                <th>Workplace</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="portal-loading">
                    Refreshing Records...
                  </td>
                </tr>
              ) : (
                (activeTab === "active" ? activeDocs : pendingDocs).map(
                  (doc) => (
                    <tr key={doc._id} className="portal-table-row">
                      <td>
                        <div className="portal-avatar">
                          <img
                            src={getFileUrl(doc, "image")}
                            alt={doc.fullName || "Doctor Photo"}
                            onError={(e) => {
                              e.target.src =
                                doc.gender === "Female"
                                  ? "/doctors/femaledoctor.png"
                                  : "/doctors/maledoctor.png";
                            }}
                          />
                        </div>
                      </td>
                      <td className="portal-cell-name">
                        <b>{doc.fullName}</b>
                      </td>
                      <td className="portal-cell-bold">
                        <b>{doc.specialization}</b>
                      </td>
                      <td>
                        <div
                          className={`portal-shift-indicator shift-${doc.shift?.toLowerCase()}`}
                        >
                          {doc.shift === "Day" ? (
                            <Sun size={16} />
                          ) : (
                            <Moon size={16} />
                          )}
                          <span>{doc.shift}</span>
                        </div>
                      </td>
                      <td className="portal-cell-bold">
                        <b>{doc.currentWorkplace || "N/A"}</b>
                      </td>
                      <td>
                        <span
                          className={`portal-gender-tag tag-${doc.status === "Active" || doc.status === "Approved" ? "male" : "female"}`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="portal-action-btns">
                          {doc.status === "Pending" && (
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(doc._id)}
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            className="btn-view"
                            onClick={() =>
                              setViewModal({ show: true, data: doc })
                            }
                          >
                            <Eye size={18} />
                          </button>
                          {doc.status !== "Pending" && (
                            <button
                              className="btn-edit"
                              onClick={() =>
                                setEditModal({ show: true, data: { ...doc } })
                              }
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(doc._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {viewModal.show && (
          <div className="portal-modal-overlay">
            <div className="portal-modal-box">
              <button
                className="portal-modal-close"
                onClick={() => setViewModal({ show: false, data: null })}
              >
                <X size={22} />
              </button>
              <div className="modal-header-section">
                <h3>Full Doctor Profile</h3>
                <p>Complete record for {viewModal.data?.fullName}</p>
              </div>
              <div className="v-view-content">
                <div className="v-profile-img-show">
                  <img
                    src={getFileUrl(viewModal.data, "image")}
                    alt={viewModal.data?.fullName || "Doctor Profile"}
                    onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"}
                  />
                </div>
                <div className="v-view-row">
                  <Mail size={18} /> <strong>Email:</strong>{" "}
                  {viewModal.data?.email}
                </div>
                <div className="v-view-row">
                  <Phone size={18} /> <strong>Mobile:</strong>{" "}
                  {viewModal.data?.phone}
                </div>
                <div className="v-view-row">
                  <Calendar size={18} /> <strong>Birth Date:</strong>{" "}
                  {new Date(viewModal.data?.dob).toLocaleDateString()}
                </div>
                <div className="v-view-row">
                  <User size={18} /> <strong>Gender:</strong>{" "}
                  {viewModal.data?.gender}
                </div>
                <div className="v-view-row">
                  <Clock size={18} /> <strong>Shift:</strong>
                  <span
                    className={`v-modal-shift-text ${viewModal.data?.shift?.toLowerCase()}`}
                  >
                    {viewModal.data?.shift} Shift
                  </span>
                </div>
                <div className="v-view-row">
                  <Briefcase size={18} /> <strong>Experience:</strong>{" "}
                  {viewModal.data?.experienceYears} Years
                </div>
                <div className="v-view-row">
                  <Stethoscope size={18} /> <strong>Speciality:</strong>{" "}
                  {viewModal.data?.specialization}
                </div>
                <div className="v-view-row">
                  <Building2 size={18} /> <strong>Workplace:</strong>{" "}
                  {viewModal.data?.currentWorkplace || "N/A"}
                </div>
                <div className="v-view-row">
                  <GraduationCap size={18} /> <strong>Degree:</strong>{" "}
                  {viewModal.data?.qualification}
                </div>
                <div className="v-view-row">
                  <ShieldCheck size={18} /> <strong>Registration:</strong>{" "}
                  {viewModal.data?.regNumber} ({viewModal.data?.regCouncil})
                </div>
                <div className="v-view-row">
                  <MapPin size={18} /> <strong>Address:</strong>{" "}
                  {viewModal.data?.address}
                </div>
                <div className="v-view-row">
                  <Lock size={18} /> <strong>Account Password:</strong>{" "}
                  <span style={{ color: "#059669", fontWeight: "900" }}>
                    {viewModal.data?.visiblePassword ||
                      (!viewModal.data?.password?.startsWith("$2") ? viewModal.data?.password : "Updating on Login...")}
                  </span>
                </div>
                <div className="v-docs-grid">
                  <button
                    className="v-doc-link"
                    onClick={() => window.open(getFileUrl(viewModal.data, "degree"), "_blank")}
                  >
                    <FileText size={16} /> View Degree
                  </button>
                  <button
                    className="v-doc-link"
                    onClick={() => window.open(getFileUrl(viewModal.data, "id"), "_blank")}
                  >
                    <ShieldCheck size={16} /> View ID Proof
                  </button>
                  <button
                    className="v-doc-link"
                    onClick={() => window.open(getFileUrl(viewModal.data, "reg"), "_blank")}
                  >
                    <FileUser size={16} /> View Registration
                  </button>
                  <button
                    className="v-doc-link"
                    onClick={() => window.open(getFileUrl(viewModal.data, "cv"), "_blank")}
                  >
                    <Briefcase size={16} /> View CV File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editModal.show && (
          <div className="portal-modal-overlay">
            <div className="portal-modal-box">
              <button
                className="portal-modal-close"
                onClick={() => setEditModal({ show: false, data: null })}
              >
                <X size={22} />
              </button>
              <div className="modal-header-section">
                <h3>Update Doctor Data</h3>
                <p>Modify professional profile for {editModal.data.fullName}</p>
              </div>
              <form
                className="portal-modal-form v-grid-2"
                onSubmit={handleUpdate}
              >
                <div className="portal-input-group">
                  <label><User size={14} /> Full Name</label>
                  <input
                    type="text"
                    value={editModal.data.fullName}
                    placeholder="Enter doctor's full name"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, fullName: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><Mail size={14} /> Email Address</label>
                  <input
                    type="email"
                    value={editModal.data.email}
                    placeholder="Enter doctor's email address"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, email: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><Phone size={14} /> Mobile Number</label>
                  <input
                    type="tel"
                    value={editModal.data.phone}
                    placeholder="Enter 10-digit mobile number"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, phone: e.target.value.replace(/\D/g, "") } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><Calendar size={14} /> Date of Birth</label>
                  <input
                    type="date"
                    value={editModal.data.dob ? new Date(editModal.data.dob).toISOString().split("T")[0] : ""}
                    placeholder="Select date of birth"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, dob: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><User size={14} /> Gender</label>
                  <select
                    value={editModal.data.gender}
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, gender: e.target.value } })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="portal-input-group">
                  <label><Clock size={14} /> Work Shift</label>
                  <select
                    value={editModal.data.shift}
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, shift: e.target.value } })}
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                  </select>
                </div>
                <div className="portal-input-group">
                  <label><Briefcase size={14} /> Specialization</label>
                  <input
                    type="text"
                    value={editModal.data.specialization}
                    placeholder="Enter specialization"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, specialization: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><GraduationCap size={14} /> Qualification</label>
                  <input
                    type="text"
                    value={editModal.data.qualification}
                    placeholder="Enter qualification"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, qualification: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><Clock size={14} /> Experience (Yrs)</label>
                  <input
                    type="number"
                    value={editModal.data.experienceYears}
                    placeholder="Enter years of experience"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, experienceYears: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><Building2 size={14} /> Workplace</label>
                  <input
                    type="text"
                    value={editModal.data.currentWorkplace || ""}
                    placeholder="Enter current workplace"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, currentWorkplace: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><ShieldCheck size={14} /> Reg Number</label>
                  <input
                    type="text"
                    value={editModal.data.regNumber}
                    placeholder="Enter registration number"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, regNumber: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group">
                  <label><ShieldCheck size={14} /> Reg Council</label>
                  <input
                    type="text"
                    value={editModal.data.regCouncil}
                    placeholder="Enter medical council name"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, regCouncil: e.target.value } })}
                    required
                  />
                </div>
                <div className="portal-input-group v-full-width">
                  <label><MapPin size={14} /> Address</label>
                  <textarea
                    value={editModal.data.address}
                    placeholder="Enter full address"
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, address: e.target.value } })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      minHeight: "80px",
                    }}
                  />
                </div>
                <div className="portal-input-group v-full-width">
                  <label><Lock size={14} /> Password (View & Change)</label>
                  <input
                    type="text"
                    value={editModal.data.visiblePassword || ""}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          visiblePassword: e.target.value,
                          password: e.target.value,
                        },
                      }))
                    }
                    placeholder="Doctor's login password"
                    style={{ color: "#059669", fontWeight: "800" }}
                  />
                  <small style={{ color: "#64748b", marginTop: "4px", display: "block" }}>Admin can view and change password directly from here.</small>
                </div>
                <div className="portal-input-group v-full-width">
                  <label><Activity size={14} /> Account Status</label>
                  <select
                    value={editModal.data.status}
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, status: e.target.value } })}
                  >
                    <option value="Active">Active</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="portal-modal-submit v-full-width"
                >
                  Save & Update Doctor
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;
