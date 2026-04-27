import React from "react";
import DoctorSidebar from "./DoctorSidebar";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./DoctorLayout.css";

const DoctorLayout = ({ children }) => {
  return (
    <div className="dr-app-container">
      <Navbar />

      <div className="dr-main-body">
        <DoctorSidebar />

        <div className="dr-content-wrapper">
          <main className="dr-actual-content">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorLayout;
