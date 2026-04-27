import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  Mail,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import "./AdminSidebar.css";
import { useAuthUser } from "../../Services/useAuthUser";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const adminMenus = [
    { name: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
    { name: "Manage Patients", path: "/admin-patients", icon: Users },
    { name: "Manage Doctors", path: "/manage-doctors", icon: Stethoscope },
    { name: "Appointments", path: "/admin-appointments", icon: CalendarCheck },
    { name: "Inquiries", path: "/admin-messages", icon: Mail },
  ];

  const handleLogout = () => {
    localStorage.removeItem("secureData");
    
    navigate("/login/admin");
  };

  return (
    <div className={`adm-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="adm-sidebar-header">
        {isOpen && (
          <h2 className="adm-logo-text">
            MediQ <span>ADMIN</span>
          </h2>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="adm-toggle-btn">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="adm-sidebar-nav">
        {adminMenus.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `adm-nav-item ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={20} />
            {isOpen && <span className="adm-nav-label">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="adm-sidebar-footer">
        {isOpen && (
          <div className="adm-user-info">
            <div className="adm-avatar">
              <ShieldCheck size={18} />
            </div>
            <div className="adm-user-meta">
              <p className="adm-user-name">{user?.name || "Admin"}</p>
              <p className="adm-user-role">Super Admin</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="adm-logout-btn">
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
