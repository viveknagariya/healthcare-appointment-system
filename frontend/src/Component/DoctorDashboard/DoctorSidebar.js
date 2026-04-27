import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  IndianRupee,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "../DoctorDashboard/DoctorSidebar.css";
import { useAuthUser } from "../../Services/useAuthUser";

const DoctorSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user, loadingForSession } = useAuthUser();

  useEffect(() => {
    localStorage.removeItem("isDoctorLoggedIn");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorName");
    localStorage.removeItem("doctorImage");
  }, []);

  let doctorName = localStorage.getItem("doctorName") || "Dr. ABC";

  if (user != null) {
    doctorName = user?.name || null;
  }
  const doctorMenus = [
    { name: "Dashboard", path: "/doctor-dashboard", icon: LayoutDashboard },
    { name: "Appointments", path: "/doctor-appointment", icon: Calendar },
    { name: "My Patients", path: "/doctor-mypatient", icon: Users },
    { name: "Earning", path: "/doctor-earning", icon: IndianRupee },
    { name: "Profile", path: "/doctor-profile", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("secureData");
    localStorage.removeItem("isDoctorLoggedIn");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorName");
    localStorage.removeItem("doctorImage");
    navigate("/doctor-login");
  };
  if (loadingForSession) return <div></div>;

  return (
    <div className={`dr-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="dr-sidebar-header">
        {isOpen && (
          <h2 className="dr-logo-text">
            MEDIQ <span>DR</span>
          </h2>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="dr-toggle-btn">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="dr-sidebar-nav">
        {doctorMenus.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `dr-nav-item ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={20} className="dr-icon" />
            {isOpen && <span className="dr-nav-label">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="dr-sidebar-footer">
        {isOpen && (
          <div className="dr-user-info">
            <div className="dr-avatar">{doctorName.charAt(0)}</div>
            <div className="dr-user-meta">
              <p className="dr-user-name">{doctorName}</p>
              <p className="dr-user-role">Specialist</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="dr-logout-btn">
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
