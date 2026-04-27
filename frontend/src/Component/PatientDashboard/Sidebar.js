import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Calendar,
  List,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "../PatientDashboard/Sidebar.css";
import { useAuthUser } from "../../Services/useAuthUser";

const PatientSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, loadingForSession } = useAuthUser();
  const navigate = useNavigate();
  let patientName = localStorage.getItem("patientName") || "Patient";

  if (user != null) {
    patientName = user?.name || "Patient";
  }
  const patientMenus = [
    { name: "Dashboard", path: "/patient-dashboard", icon: LayoutDashboard },
    { name: "Profile", path: "/patient-profile", icon: User },
    { name: "Appointments", path: "/appointments", icon: Calendar },
    { name: "My Bookings", path: "/patient-appointments", icon: List },
  ];

  const handleLogout = () => {
    localStorage.removeItem("secureData");
    
    navigate("/login");
  };

  if (loadingForSession) return <div></div>;

  return (
    <div className={`pt-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="pt-sidebar-header">
        {isOpen && (
          <h2 className="pt-logo-text">
            MEDIQ <span>PT</span>
          </h2>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="pt-toggle-btn">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="pt-sidebar-nav">
        {patientMenus.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `pt-nav-item ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={20} className="pt-icon" />
            {isOpen && <span className="pt-nav-label">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="pt-sidebar-footer">
        {isOpen && (
          <div className="pt-user-info">
            <div className="pt-avatar">{patientName.charAt(0)}</div>
            <div className="pt-user-meta">
              <p className="pt-user-name">{patientName}</p>
              <p className="pt-user-role">Patient</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="pt-logout-btn">
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default PatientSidebar;
