import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Mail,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminInquiry.css";

const AdminInquiry = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/inquiries/all");
        setInquiries(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const showToastMsg = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      5002,
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await axios.delete(`http://localhost:5000/api/inquiries/delete/${id}`);
        setInquiries(inquiries.filter((inq) => inq._id !== id));
        showToastMsg("Inquiry deleted successfully!");
      } catch (err) {
        showToastMsg("Delete failed", "error");
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Patient Inquiry Report", 14, 20);

    const tableColumn = ["Date", "Patient Name", "Email", "Message"];
    const tableRows = filteredInquiries.map((inq) => [
      new Date(inq.createdAt).toLocaleDateString(),
      inq.name,
      inq.email,
      inq.message,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [11, 31, 92] },
    });

    doc.save("Inquiry_List.pdf");
  };

  const filteredInquiries = inquiries.filter(
    (inq) =>
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return <div className="adm-inq-loading">Loading Inquiries...</div>;

  return (
    <div className="adm-inq-wrapper">
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
            className="adm-inq-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <div className="adm-inq-header">
        <div className="adm-inq-title-box">
          <Mail size={24} color="#1A1F2C" />
          <h2>Inquiry Messages</h2>
          <span className="adm-inq-badge">{inquiries.length} New</span>
        </div>

        <div className="inq-master-controls">
          <div className="adm-inq-search">
            <Search size={18} className="adm-inq-search-icon" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="inq-master-pdf-btn" onClick={handleDownloadPDF}>
            <FileText size={20} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="adm-inq-table-container">
        <table className="adm-inq-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient Name</th>
              <th>Contact Email</th>
              <th>Message Content</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map((inq) => (
                <tr key={inq._id}>
                  <td className="adm-inq-date">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="adm-inq-name">{inq.name}</td>
                  <td className="adm-inq-email">{inq.email}</td>
                  <td className="adm-inq-message">
                    <p title={inq.message}>{inq.message}</p>
                  </td>
                  <td className="adm-inq-action">
                    <button
                      className="adm-inq-delete-btn"
                      onClick={() => handleDelete(inq._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="adm-inq-empty">
                  No inquiries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInquiry;
