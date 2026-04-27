import React from "react";
import PatientSidebar from "./Sidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./PatientLayout.css";

const PatientLayout = ({ children }) => {
  return (
    <div className="pt-shell-root">
      <div className="pt-shell-navbar">
        <Navbar />
      </div>

      <div className="pt-shell-middle">
        <PatientSidebar />
        <main className="pt-shell-main">{children}</main>
      </div>

      <div className="pt-shell-footer">
        <Footer />
      </div>
    </div>
  );
};

export default PatientLayout;
