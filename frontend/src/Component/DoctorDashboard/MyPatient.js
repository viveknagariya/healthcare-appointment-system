import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, X, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../DoctorDashboard/MyPatient.css";
import { useAuthUser } from "../../Services/useAuthUser";

const MyPatient = () => {
  const { user } = useAuthUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const doctorId = user?.userId;

  const showToastMsg = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      5002,
    );
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/appointments/doctor/${doctorId}`,
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching patients", err);
      }
    };

    if (doctorId) fetchPatients();
  }, [doctorId]);

  const patients = useMemo(() => {
    const map = new Map();

    appointments.forEach((app) => {
      const pId = (app.patientId?._id || app.patientId)?.toString();
      if (pId && !map.has(pId)) {
        map.set(pId, {
          id: pId,
          name: app.patientName,
          phone: app.patientPhone,
          email: app.patientEmail || "",
          lastVisit: app.appointmentDate,
          status: app.status,
        });
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeletePatient = async (patientId) => {
    if (!patientId) return;
    const pidString = patientId.toString().trim();
    if (
      window.confirm(
        "Are you sure you want to delete this patient? This will remove all their data from the system.",
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/patient/${pidString}`);
        showToastMsg("Patient deleted successfully!");
        setAppointments((prev) =>
          prev.filter((app) => {
            const appId = (app.patientId?._id || app.patientId)
              ?.toString()
              .trim();
            return appId !== pidString;
          }),
        );
      } catch (err) {
        console.error("Delete failed", err);
        showToastMsg("Failed to delete patient", "error");
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("My Patients Record List", 14, 20);

    const tableColumn = ["Patient Name", "Phone", "Last Visit", "Status"];
    const tableRows = filteredPatients.map((p) => [
      p.name,
      p.phone,
      formatDate(p.lastVisit),
      p.status || "Pending",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [11, 31, 92] },
    });

    doc.save("My_Patients_List.pdf");
  };

  return (
    <div className="myp-wrapper">
      {toast.show && (
        <div
          className={`adm-notification-toast adm-toast-top ${toast.type === "error" ? "error-variant" : "success-variant"}`}
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
            className="myp-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <div className="myp-header">
        <div>
          <h1>
            My Patients <span className="myp-bold">List</span>
          </h1>
          <p>Patients who booked appointments with you.</p>
        </div>

        <div className="myp-master-action-group">
          <div className="myp-search">
            <input
              type="text"
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="myp-master-pdf-btn" onClick={handleDownloadPDF}>
            <FileText size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="myp-table-container">
        <table className="myp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Last Visit</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => (
                <tr key={p.id}>
                  <td className="myp-name">
                    <strong>{p.name}</strong>
                  </td>
                  <td>{p.phone}</td>
                  <td>{formatDate(p.lastVisit)}</td>
                  <td>
                    <span
                      className={`myp-status ${p.status?.toLowerCase() || "pending"}`}
                    >
                      {p.status || "Pending"}
                    </span>
                  </td>
                  <td className="myp-actions">
                    <button
                      className="myp-view-btn"
                      onClick={() => setSelectedPatient(p)}
                    >
                      View
                    </button>
                    <button
                      className="myp-delete-btn"
                      onClick={() => handleDeletePatient(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="myp-empty-cell">
                  No patients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPatient && (
        <div className="myp-modal">
          <div className="myp-modal-content">
            <h2 className="myp-modal-name">{selectedPatient.name}</h2>
            <p className="myp-modal-phone">{selectedPatient.phone}</p>
            {selectedPatient.email && (
              <p className="myp-modal-email">{selectedPatient.email}</p>
            )}
            <button
              className="myp-close-btn"
              onClick={() => setSelectedPatient(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPatient;
