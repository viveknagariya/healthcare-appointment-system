import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { LayoutGrid, Trash2, Calendar, FileText, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminAppointments.css";

const AdminAppointments = () => {
  const [allAppts, setAllAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const showHospToast = useCallback((msg, type) => {
    toast.custom((t) => (
      <div
        className={`hosp-med-toast ${t.visible ? "hosp-toast-enter" : "hosp-toast-exit"}`}
      >
        <div className="hosp-toast-top-line"></div>
        <div className="hosp-toast-inner">
          <div className="hosp-toast-content">
            <span className="hosp-toast-status">
              {type === "success" ? "Success" : "Database Alert"}
            </span>
            <p className="hosp-toast-text">{msg}</p>
          </div>
          <button
            className="hosp-toast-close"
            onClick={() => toast.dismiss(t.id)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="hosp-toast-timer-bar"></div>
      </div>
    ));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apptRes = await axios.get(
          "http://localhost:5000/api/appointments/all?summary=1",
        );
        const doctorsRes = await axios.get(
          "http://localhost:5000/api/doctors/admin/all?summary=1",
        );
        const doctors = doctorsRes.data.doctors;

        const updated = apptRes.data.map((app) => {
          const doc = doctors.find((d) => d._id === app.doctorId);
          return {
            ...app,
            doctorName: doc ? doc.fullName : "Unknown",
          };
        });

        setAllAppts(updated);
        setLoading(false);
      } catch (err) {
        showHospToast("Server Connection Failed", "error");
        setLoading(false);
      }
    };
    fetchData();
  }, [showHospToast]);

  const filteredAppts = selectedDate
    ? allAppts.filter((app) => app.appointmentDate?.startsWith(selectedDate))
    : allAppts;

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`);
      setAllAppts((prev) => prev.filter((app) => app._id !== id));
      showHospToast("Appointment Deleted Successfully", "success");
    } catch (err) {
      showHospToast("Delete Failed", "error");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Hospital Appointment Report", 14, 15);
    const tableRows = filteredAppts.map((app) => [
      app.patientName,
      app.doctorName,
      app.appointmentDate,
      app.timeSlot,
      app.status,
      `Rs. ${app.consultationFee}`,
    ]);
    autoTable(doc, {
      startY: 25,
      head: [["Patient", "Doctor", "Date", "Time", "Status", "Fee"]],
      body: tableRows,
    });
    doc.save("appointments.pdf");
  };

  if (loading)
    return <div className="hosp-loading-screen">Refreshing Records...</div>;

  return (
    <div className="hosp-admin-wrapper">
      <Toaster
        position="top-right"
        containerStyle={{
          top: "85px",
          right: "40px",
        }}
        toastOptions={{
          duration: 5002,
        }}
      />

      <div className="hosp-header-section">
        <div className="hosp-title-group">
          <h1>
            <LayoutGrid size={26} /> Hospital Master List
          </h1>
          <p>Manage and monitor all doctor-patient bookings</p>
        </div>

        <div className="hosp-action-tools">
          <div className="hosp-date-input-wrapper">
            <Calendar size={18} className="hosp-input-icon" />
            <input
              type="date"
              className="hosp-blue-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button className="hosp-blue-action-btn" onClick={handleDownloadPDF}>
            <FileText size={18} /> Download PDF
          </button>

          <div className="hosp-blue-stats-card">
            <span className="hosp-stats-label">Total Bookings</span>
            <h3 className="hosp-stats-value">{filteredAppts.length}</h3>
          </div>
        </div>
      </div>

      <div className="hosp-table-container">
        <table className="hosp-main-data-table">
          <thead>
            <tr>
              <th>Patient Details</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Consultation Fee</th>
              <th className="hosp-text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppts.map((app) => (
              <tr key={app._id} className="hosp-table-row">
                <td>
                  <div className="hosp-patient-info">
                    <p className="hosp-name-text">{app.patientName}</p>
                    <p className="hosp-sub-text">{app.patientEmail}</p>
                  </div>
                </td>
                <td>
                  <p className="hosp-name-text">{app.doctorName}</p>
                </td>
                <td>
                  <div className="hosp-datetime-info">
                    <p className="hosp-date-text">{app.appointmentDate}</p>
                    <span className="hosp-slot-text">{app.timeSlot}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`hosp-status-tag ${app.status?.toLowerCase() === "approved" ? "hosp-tag-success" : "hosp-tag-warning"}`}
                  >
                    {app.status}
                  </span>
                </td>
                <td>
                  <span className="hosp-amount-tag">
                    Rs. {app.consultationFee}
                  </span>
                </td>
                <td className="hosp-text-right">
                  <button
                    className="hosp-icon-delete-btn"
                    onClick={() => handleDelete(app._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAppointments;
