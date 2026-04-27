import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Search,
  Calendar,
  MessageSquare,
  Edit2,
  AlertCircle,
  X,
  FileText,
  Trash2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./DoctorAppointment.css";
import { useAuthUser } from "../../Services/useAuthUser";

const DoctorAppointment = () => {
  const { user } = useAuthUser();

  const [appointmentsList, setAppointmentsList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [appointmentDateFilter, setAppointmentDateFilter] = useState("");
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [instructionsInput, setInstructionsInput] = useState("");
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [toastState, setToastState] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const displayToastNotification = useCallback((message, notificationType = "success") => {
    setToastState({ isVisible: true, message, type: notificationType });
    setTimeout(
      () => setToastState({ isVisible: false, message: "", type: "success" }),
      5002,
    );
  }, []);

  const loadAppointmentsData = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/appointments/doctor/${user?.userId}`,
      );
      setAppointmentsList(response.data);
      setIsLoadingData(false);
    } catch {
      displayToastNotification("Failed to load appointments", "error");
      setIsLoadingData(false);
    }
  }, [user?.userId, displayToastNotification]);

  useEffect(() => {
    if (user != null) {
      loadAppointmentsData();
    }
  }, [user, loadAppointmentsData]);

  const filteredAppointmentsList = useMemo(() => {
    return appointmentsList.filter((appointmentItem) => {
      const patientNameLower = appointmentItem.patientName
        ? appointmentItem.patientName.toLowerCase()
        : "";
      const phoneNumber = appointmentItem.patientPhone
        ? appointmentItem.patientPhone
        : "";
      const matchesPatientSearch =
        patientNameLower.includes(patientSearchQuery.toLowerCase()) ||
        phoneNumber.includes(patientSearchQuery);

      const matchesDateFilter = appointmentDateFilter
        ? appointmentItem.appointmentDate?.startsWith(appointmentDateFilter)
        : true;

      return matchesPatientSearch && matchesDateFilter;
    });
  }, [appointmentsList, patientSearchQuery, appointmentDateFilter]);

  const sortedAppointmentsList = useMemo(() => {
    return [...filteredAppointmentsList].sort(
      (appointmentA, appointmentB) =>
        new Date(appointmentB.createdAt) - new Date(appointmentA.createdAt),
    );
  }, [filteredAppointmentsList]);

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/status/${appointmentId}`,
        {
          status: newStatus,
        },
      );

      setAppointmentsList((previousList) =>
        previousList.map((appointmentItem) =>
          appointmentItem._id === appointmentId
            ? { ...appointmentItem, status: newStatus }
            : appointmentItem,
        ),
      );

      displayToastNotification(
        `Appointment ${newStatus} Successfully!`,
        "success",
      );
    } catch {
      displayToastNotification("Update failed", "error");
    }
  };

  const removeAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/appointments/${appointmentId}`,
        );
        setAppointmentsList((previousList) =>
          previousList.filter(
            (appointmentItem) => appointmentItem._id !== appointmentId,
          ),
        );
        displayToastNotification(
          "Appointment Deleted Successfully!",
          "success",
        );
      } catch (error) {
        displayToastNotification("Failed to delete appointment", "error");
      }
    }
  };

  const openInstructionsModal = (appointmentId, currentInstructions) => {
    setCurrentAppointmentId(appointmentId);
    setInstructionsInput(currentInstructions || "");
    setIsInstructionsModalOpen(true);
  };

  const closeInstructionsModal = () => {
    setIsInstructionsModalOpen(false);
    setCurrentAppointmentId(null);
    setInstructionsInput("");
  };

  const saveInstructionsToAppointment = async () => {
    if (!currentAppointmentId) return;
    const trimmedInstructions = instructionsInput.trim();

    try {
      await axios.put(
        `http://localhost:5000/api/appointments/doctor-note/${currentAppointmentId}`,
        { doctorNote: trimmedInstructions },
      );

      setAppointmentsList((previousList) =>
        previousList.map((appointmentItem) =>
          appointmentItem._id === currentAppointmentId
            ? { ...appointmentItem, doctorNote: trimmedInstructions }
            : appointmentItem,
        ),
      );

      displayToastNotification("Instructions saved successfully!", "success");
      closeInstructionsModal();
    } catch (error) {
      displayToastNotification("Failed to update instructions", "error");
    }
  };

  const generateAndDownloadPDF = () => {
    const document = new jsPDF();
    document.setFontSize(18);
    document.text("MediQ Doctor Appointment List", 14, 20);

    const pdfTableColumns = ["Patient", "Phone", "Date", "Slot", "Status"];
    const pdfTableRows = sortedAppointmentsList.map((appointmentItem) => [
      appointmentItem.patientName,
      appointmentItem.patientPhone,
      formatAppointmentDate(appointmentItem.appointmentDate),
      appointmentItem.timeSlot,
      appointmentItem.status,
    ]);

    autoTable(document, {
      startY: 30,
      head: [pdfTableColumns],
      body: pdfTableRows,
      theme: "grid",
      headStyles: { fillColor: [11, 31, 92] },
    });

    document.save("Doctor_Schedule.pdf");
  };

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoadingData) {
    return <div className="appointmentLoadingIndicator">Loading...</div>;
  }

  return (
    <div className="appointmentListWrapper">
      {toastState.isVisible && (
        <div
          className={`toastNotification ${toastState.type === "error" ? "toastError" : ""
            }`}
        >
          {toastState.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <div>
            <strong>
              {toastState.type === "success" ? "Success:" : "Error:"}
            </strong>{" "}
            {toastState.message}
          </div>
          <X
            size={16}
            onClick={() => setToastState({ ...toastState, isVisible: false })}
            className="toastCloseButton"
          />
          <div className="toastTimerLine toastTimerAnimation"></div>
        </div>
      )}

      <div className="appointmentListHeader">
        <div className="appointmentListHeaderLeft">
          <h2>
            <Clock size={24} /> Appointment Schedule
          </h2>
          <span className="appointmentCountBadge">
            Total: {filteredAppointmentsList.length}
          </span>
        </div>

        <div className="appointmentListHeaderRight">
          <div className="appointmentSearchBar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search patient..."
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
            />
          </div>

          <div className="dateFilterButton">
            <Calendar size={18} className="filterIconSpacing" />
            <input
              type="date"
              value={appointmentDateFilter}
              onChange={(e) => setAppointmentDateFilter(e.target.value)}
            />
          </div>

          <button
            className="downloadPdfButton"
            onClick={generateAndDownloadPDF}
          >
            <FileText size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="appointmentTableCard">
        <table className="appointmentTable">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date &amp; Slot</th>
              <th>Status</th>
              <th>Instructions</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedAppointmentsList.length > 0 ? (
              sortedAppointmentsList.map((appointmentItem) => (
                <tr key={appointmentItem._id}>
                  <td>
                    <div className="patientInfoContainer">
                      <User size={16} />
                      <div>
                        <p className="patientNameText">
                          {appointmentItem.patientName || "N/A"}
                        </p>
                        <p className="patientPhoneText">
                          {appointmentItem.patientPhone || "No Phone"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="appointmentDateCell">
                      <strong>
                        {formatAppointmentDate(appointmentItem.appointmentDate)}
                      </strong>
                      <span>{appointmentItem.timeSlot}</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`statusBadge ${appointmentItem.status.toLowerCase()}`}
                    >
                      {appointmentItem.status}
                    </span>
                  </td>

                  <td>
                    <div className="instructionsBox">
                      {appointmentItem.doctorNote ? (
                        <p className="instructionsText">
                          <MessageSquare size={14} />{" "}
                          {appointmentItem.doctorNote}
                        </p>
                      ) : (
                        <span className="instructionsEmpty">
                          No instructions
                        </span>
                      )}

                      <button
                        type="button"
                        className="instructionsEditButton"
                        onClick={() =>
                          openInstructionsModal(
                            appointmentItem._id,
                            appointmentItem.doctorNote,
                          )
                        }
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </td>

                  <td>
                    <div className="actionButtonsGroup">
                      {appointmentItem.status === "Pending" ? (
                        <>
                          <button
                            type="button"
                            className="acceptButton"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointmentItem._id,
                                "Approved",
                              )
                            }
                          >
                            <CheckCircle size={16} /> Accept
                          </button>

                          <button
                            type="button"
                            className="rejectButton"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointmentItem._id,
                                "Rejected",
                              )
                            }
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="processedStatus">Processed</span>
                      )}

                      <button
                        type="button"
                        className="deleteButton"
                        onClick={() => removeAppointment(appointmentItem._id)}
                        title="Delete Appointment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="emptyAppointmentMessage">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isInstructionsModalOpen && (
        <div className="instructionsModalOverlay">
          <div className="instructionsModalCard">
            <div className="instructionsModalHeader">
              <h3>Patient Instructions</h3>
              <button
                type="button"
                className="instructionsModalCloseButton"
                onClick={closeInstructionsModal}
              >
                <X size={18} />
              </button>
            </div>

            <div className="instructionsModalBody">
              <label>Message for Patient:</label>
              <textarea
                placeholder="Type your message here..."
                value={instructionsInput}
                onChange={(e) => setInstructionsInput(e.target.value)}
                maxLength={250}
              />
              <div className="instructionsModalCharacterCount">
                <span>{instructionsInput.trim().length}/250</span>
              </div>
            </div>

            <div className="instructionsModalFooter">
              <button
                className="instructionsModalCancelButton"
                type="button"
                onClick={closeInstructionsModal}
              >
                Cancel
              </button>
              <button
                className="instructionsModalSaveButton"
                type="button"
                onClick={saveInstructionsToAppointment}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;
