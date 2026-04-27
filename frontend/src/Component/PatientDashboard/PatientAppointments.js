import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, User, Calendar, AlertCircle } from "lucide-react";
import "./PatientAppointments.css";
import { useAuthUser } from "../../Services/useAuthUser";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsMap, setDoctorsMap] = useState({});
  const { user } = useAuthUser();
  useEffect(() => {
    if (user != null) {
      const userId = user?.userId || null;
      axios
        .get("http://localhost:5000/api/doctors/all?summary=1")
        .then((docRes) => {
          const docs = docRes.data.doctors || [];
          const dMap = {};
          docs.forEach((d) => (dMap[d._id] = d.fullName));
          setDoctorsMap(dMap);

          axios
            .get(`http://localhost:5000/api/appointments/all?patientId=${userId}&summary=1`)
            .then((res) => {
              setAppointments(res.data || []);
              setLoading(false);
            })
            .catch(() => setLoading(false));
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDr = (name) => (name?.startsWith("Dr.") ? name : `Dr. ${name}`);

  if (loading) return <div className="ptx-loading">Loading Bookings...</div>;

  return (
    <div className="ptx-apt-page-wrapper">
      <div className="ptx-apt-header">
        <div className="ptx-apt-header-left">
          <h2>
            <Calendar size={24} /> My Processed Bookings
          </h2>
          <span className="ptx-apt-count">
            Total History: {appointments.length}
          </span>
        </div>
      </div>

      <div className="ptx-apt-table-card">
        <table className="ptx-master-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Approve / Reject Status</th>
              <th>Instructions from Doctor</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((app) => {
                const docName =
                  app.doctorId?.fullName ||
                  doctorsMap[app.doctorId?._id || app.doctorId] ||
                  app.doctor ||
                  "Unknown";
                return (
                  <tr key={app._id}>
                    <td>
                      <div className="ptx-d-info">
                        <User size={16} />
                        <span className="ptx-d-name">{formatDr(docName)}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{formatDate(app.appointmentDate)}</strong>
                    </td>
                    <td>
                      <span className="ptx-time-badge">
                        <Clock size={12} /> {app.timeSlot}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`ptx-status-badge ${app.status?.toLowerCase() || "pending"
                          }`}
                      >
                        {app.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      {app.doctorNote ? (
                        <div className="ptx-doc-note">
                          <AlertCircle size={14} />
                          <span>{app.doctorNote}</span>
                        </div>
                      ) : (
                        <span className="ptx-no-note">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="ptx-empty">
                  No appointments booked yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientAppointments;
