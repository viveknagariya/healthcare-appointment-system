import React, { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  Edit,
  Search,
  UserCheck,
  X,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../AdminPanel/AdminPatientList.css";

const AdminPatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const [updatedData, setUpdatedData] = useState({
    name: "",
    number: "",
    gender: "",
  });

  const backendBaseURL = "http://localhost:5000";

  const showNotification = useCallback((msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast({ show: false, msg: "", type: "" });
    }, 5002);
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("data:") || path.startsWith("http")) return path;

    const cleanPath = path.replace(/\\/g, "/");
    return `${backendBaseURL}/${cleanPath}`;
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendBaseURL}/api/patients`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      showNotification("Database connection failed.", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async (id) => {
    if (window.confirm("Permanently remove patient record?")) {
      try {
        const response = await fetch(`${backendBaseURL}/api/patients/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          showNotification("Record permanently removed.", "green");
          fetchPatients();
        }
      } catch {
        showNotification("Deletion failed.", "error");
      }
    }
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setUpdatedData({
      name: patient?.name || "",
      number: patient?.number || "",
      gender: patient?.gender || "Male",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${backendBaseURL}/api/patients/${editingPatient._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        },
      );

      const result = await response.json();

      if (result.success) {
        setEditingPatient(null);
        showNotification("Database record updated successfully!", "green");
        fetchPatients();
      }
    } catch {
      showNotification("Update failed.", "error");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MediQ Patient Records", 14, 20);

    const tableColumn = ["Full Name", "Mobile Number", "Gender"];
    const tableRows = filteredPatients.map((p) => [
      p.name || "Anonymous",
      p.number || "N/A",
      p.gender || "Other",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [11, 31, 92] },
    });

    doc.save("Patient_List.pdf");
  };

  const filteredPatients = patients.filter((p) => {
    const name = p?.name ? p.name.toLowerCase() : "";
    const num = p?.number || "";
    const query = searchTerm.toLowerCase();
    return name.includes(query) || num.includes(query);
  });

  return (
    <div className="patient-list-portal-wrapper">
      {toast.show && (
        <div className={`patient-list-toast toast-type-${toast.type}`}>
          <div className="patient-list-toast-inner">
            <div className="patient-list-toast-icon">
              {toast.type === "green" ? (
                <CheckCircle size={22} />
              ) : (
                <AlertTriangle size={22} />
              )}
            </div>

            <div className="patient-list-toast-content">
              <span className="patient-list-toast-status">
                {toast.type === "green" ? "SUCCESS" : "DATABASE ALERT"}
              </span>
              <p className="patient-list-toast-text">{toast.msg}</p>
            </div>

            <button
              className="patient-list-toast-close"
              onClick={() => setToast({ ...toast, show: false })}
            >
              <X size={16} />
            </button>
          </div>
          <div className="patient-list-toast-timer"></div>
        </div>
      )}

      <div className="patient-list-main-content">
        <header className="patient-list-header-card">
          <div className="patient-list-header-info">
            <div className="patient-list-icon-box">
              <UserCheck size={36} color="#1A1F2C" />
            </div>

            <div className="patient-list-text-box">
              <h1>Manage Patients</h1>

              <div className="patient-list-badges">
                <span className="patient-list-count">
                  Total: {patients.length}
                </span>

                <span className="patient-list-live">
                  <Activity size={14} /> Live Sync
                </span>
              </div>
            </div>
          </div>

          <div className="patient-list-actions-bar">
            <div className="patient-list-search-wrapper">
              <Search size={20} className="patient-list-search-icon" />
              <input
                type="text"
                placeholder="Find patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="patient-list-action-btn"
              onClick={handleDownloadPDF}
            >
              <FileText size={20} />
              <span>Download PDF</span>
            </button>
          </div>
        </header>

        <div className="patient-list-table-container">
          <table className="patient-list-data-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Full Name</th>
                <th>Mobile Number</th>
                <th>Gender</th>
                <th className="patient-list-text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="patient-list-loading">
                    Synchronizing Database...
                  </td>
                </tr>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient._id} className="patient-list-table-row">
                    <td>
                      <div className="patient-list-avatar">
                        {patient.profilePic ? (
                          <img
                            src={getImageUrl(patient.profilePic)}
                            alt={patient.name || "Patient photo"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                patient.gender === "Female"
                                  ? "/doctors/femaledoctor.png"
                                  : "/doctors/maledoctor.png";
                            }}
                          />
                        ) : (
                          <div className="patient-list-avatar-init">
                            {patient?.name
                              ? patient.name[0].toUpperCase()
                              : "P"}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="patient-list-cell-name">
                      {patient?.name || "Anonymous"}
                    </td>

                    <td className="patient-list-cell-number">
                      {patient?.number || "N/A"}
                    </td>

                    <td>
                      <span
                        className={`patient-list-gender-tag tag-${patient?.gender?.toLowerCase()}`}
                      >
                        {patient?.gender || "Other"}
                      </span>
                    </td>

                    <td className="patient-list-text-right">
                      <div className="patient-list-row-actions">
                        <button
                          className="patient-list-btn-edit"
                          onClick={() => handleEditClick(patient)}
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          className="patient-list-btn-delete"
                          onClick={() => handleDelete(patient._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="patient-list-empty">
                    <AlertTriangle size={48} />
                    <h3>No Records</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editingPatient && (
          <div className="patient-list-modal-overlay">
            <div className="patient-list-modal-box">
              <button
                className="patient-list-modal-close"
                onClick={() => setEditingPatient(null)}
              >
                <X size={22} />
              </button>

              <div className="patient-list-modal-header">
                <h3>Update Patient Info</h3>
                <p>Modifying entry for {editingPatient.name}</p>
              </div>

              <form className="patient-list-modal-form" onSubmit={handleUpdate}>
                <div className="patient-list-input-group">
                  <label>Full Patient Name</label>
                  <input
                    type="text"
                    value={updatedData.name}
                    placeholder="Enter patient's full name"
                    onChange={(e) =>
                      setUpdatedData({ ...updatedData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="patient-list-input-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    maxLength="10"
                    value={updatedData.number}
                    placeholder="Enter 10-digit mobile number"
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        number: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    required
                  />
                </div>

                <div className="patient-list-input-group">
                  <label>Gender Selection</label>
                  <select
                    value={updatedData.gender}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        gender: e.target.value,
                      })
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button type="submit" className="patient-list-modal-submit">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPatientsList;
