import React from "react";
import AdminSidebar from "./Adminsidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="adm-layout-root">
      <div className="adm-layout-navbar">
        <Navbar />
      </div>

      <div className="adm-layout-middle">
        <AdminSidebar />

        <main className="adm-layout-main">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;
