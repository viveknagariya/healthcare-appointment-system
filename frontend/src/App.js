import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./Component/Navbar/Navbar";
import Footer from "./Component/Footer/Footer";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Contact from "./Pages/Contact/Contact";
import Doctors from "./Pages/Doctor/Doctor";
import Services from "./Services/Service";
import Login from "./Component/Auth/Login";
import Register from "./Component/Auth/Register";
import Chatbot from "./Pages/Chatbot/Chatbot";
import PatientLayout from "./Component/PatientDashboard/PatientLayout";
import Dashboard from "./Component/PatientDashboard/Dashboard";
import PatientProfile from "./Component/PatientDashboard/PatientProfile";
import Appointments from "./Component/PatientDashboard/Appointments";
import PatientAppointments from "./Component/PatientDashboard/PatientAppointments";
import DoctorLogin from "./Component/DoctorDashboard/DoctorLogin";
import DoctorDashboard from "./Component/DoctorDashboard/DoctorDashboard";
import DoctorRegister from "./Component/DoctorDashboard/DoctorRegister";
import DoctorLayout from "./Component/DoctorDashboard/DoctorLayout";
import DoctorAppointment from "./Component/DoctorDashboard/DoctorAppointment";
import MyPatient from "./Component/DoctorDashboard/MyPatient";
import Earning from "./Component/DoctorDashboard/Earning";
import Profile from "./Component/DoctorDashboard/Profile";
import AdminLayout from "./Component/AdminPanel/AdminLayout";
import AdminLogin from "./Component/AdminPanel/AdminLogin";
import AdminDashboard from "./Component/AdminPanel/AdminDashboard";
import AdminSidebar from "./Component/AdminPanel/Adminsidebar";
import AdminPatientsList from "./Component/AdminPanel/AdminPatientList";
import ManageDoctors from "./Component/AdminPanel/ManageDoctors";
import AdminAppointments from "./Component/AdminPanel/AdminAppointments";
import AdminInquiry from "./Component/AdminPanel/AdminInquiry";
import ProtectedRoute from "./Services/ProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reloadKey = "mediq_last_reloaded_path";
    const lastReloadedPath = sessionStorage.getItem(reloadKey);

    if (lastReloadedPath !== pathname) {
      sessionStorage.setItem(reloadKey, pathname);
      window.location.reload();
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
              <Footer />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <Contact />
              <Footer />
            </>
          }
        />
        <Route
          path="/doctors"
          element={
            <>
              <Navbar />
              <Doctors />
              <Footer />
            </>
          }
        />
        <Route
          path="/services"
          element={
            <>
              <Navbar />
              <Services />
              <Footer />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Login />
              <Footer />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <Navbar />
              <Register />
              <Footer />
            </>
          }
        />
        <Route path="/chatbot" element={<Chatbot />} />

        <Route
          path="/login/admin"
          element={
            <>
              <Navbar />
              <AdminLogin />
              <Footer />
            </>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-sidebar"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSidebar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-patients"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminPatientsList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-appointments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminAppointments />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-doctors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <ManageDoctors />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-messages"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminInquiry />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientLayout>
                <Dashboard />
              </PatientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-profile"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientLayout>
                <PatientProfile />
              </PatientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientLayout>
                <Appointments />
              </PatientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-appointments"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientLayout>
                <PatientAppointments />
              </PatientLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-login"
          element={
            <>
              <Navbar />
              <DoctorLogin />
              <Footer />
            </>
          }
        />
        <Route
          path="/doctor-register"
          element={
            <>
              <Navbar />
              <DoctorRegister />
              <Footer />
            </>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorLayout>
                <DoctorDashboard />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-appointment"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorLayout>
                <DoctorAppointment />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-mypatient"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorLayout>
                <MyPatient />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-earning"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorLayout>
                <Earning />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-profile"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorLayout>
                <Profile />
              </DoctorLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
