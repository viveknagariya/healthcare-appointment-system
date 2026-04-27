import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Stethoscope,
  CalendarCheck,
  UserCheck,
  Hand,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboard.css";
import { useAuthUser } from "../../Services/useAuthUser";

const COLORS_GENDER = ["#4f46e5", "#e879f9"];
const COLORS_STATUS = ["#10b981", "#f59e0b", "#ef4444"];

const AdminDashboard = () => {
  const { user } = useAuthUser();

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingDoctors: 0,
  });

  const [doctorGenderData, setDoctorGenderData] = useState([]);
  const [patientGenderData, setPatientGenderData] = useState([]);
  const [appointmentStatusData, setAppointmentStatusData] = useState([]);

  const normalizeGender = (value) => {
    const gender = (value || "").toString().trim().toLowerCase();
    if (gender === "m" || gender === "male") return "Male";
    if (gender === "f" || gender === "female") return "Female";
    return "Other";
  };

  const normalizeStatus = (value) => {
    const status = (value || "").toString().trim().toLowerCase();
    if (status === "approved" || status === "confirmed") return "Approved";
    if (status === "pending") return "Pending";
    if (
      status === "rejected" ||
      status === "cancelled" ||
      status === "canceled"
    ) {
      return "Rejected";
    }
    return status;
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/doctors/admin/all?summary=1").then((res) => {
      const docs = res.data.doctors || [];
      const male = docs.filter((d) => normalizeGender(d.gender) === "Male").length;
      const female = docs.filter(
        (d) => normalizeGender(d.gender) === "Female",
      ).length;
      const pending = docs.filter((d) => d.status === "Pending").length;

      setDoctorGenderData([
        { name: "Male", value: male },
        { name: "Female", value: female },
      ]);

      setStats((prev) => ({
        ...prev,
        totalDoctors: docs.length,
        pendingDoctors: pending,
      }));
    });

    axios.get("http://localhost:5000/api/patients?compact=1").then((res) => {
      const pts = res.data || [];
      const male = pts.filter((p) => normalizeGender(p.gender) === "Male").length;
      const female = pts.filter(
        (p) => normalizeGender(p.gender) === "Female",
      ).length;

      setPatientGenderData([
        { name: "Male", value: male },
        { name: "Female", value: female },
      ]);

      setStats((prev) => ({ ...prev, totalPatients: pts.length }));
    });

    axios.get("http://localhost:5000/api/appointments/all?summary=1").then((res) => {
      const apts = res.data || [];
      const approved = apts.filter(
        (a) => normalizeStatus(a.status) === "Approved",
      ).length;
      const pending = apts.filter(
        (a) => normalizeStatus(a.status) === "Pending",
      ).length;
      const rejected = apts.filter(
        (a) => normalizeStatus(a.status) === "Rejected",
      ).length;

      setAppointmentStatusData([
        { name: "Approved", value: approved },
        { name: "Pending", value: pending },
        { name: "Rejected", value: rejected },
      ]);

      setStats((prev) => ({ ...prev, totalAppointments: apts.length }));
    });
  }, []);

  const statCards = [
    {
      title: "Total Patients",
      count: stats.totalPatients,
      icon: Users,
      iconBgClass: "adm-stat-icon-patients",
      iconColor: "#4f46e5",
    },
    {
      title: "Total Doctors",
      count: stats.totalDoctors,
      icon: Stethoscope,
      iconBgClass: "adm-stat-icon-doctors",
      iconColor: "#16a34a",
    },
    {
      title: "Total Appointments",
      count: stats.totalAppointments,
      icon: CalendarCheck,
      iconBgClass: "adm-stat-icon-appointments",
      iconColor: "#ea580c",
    },
    {
      title: "Pending Doctors",
      count: stats.pendingDoctors,
      icon: UserCheck,
      iconBgClass: "adm-stat-icon-pending",
      iconColor: "#dc2626",
    },
  ];

  const visibleDoctorGenderData = doctorGenderData.filter(
    (item) => Number(item.value) > 0,
  );
  const visiblePatientGenderData = patientGenderData.filter(
    (item) => Number(item.value) > 0,
  );
  const visibleAppointmentStatusData = appointmentStatusData.filter(
    (item) => Number(item.value) > 0,
  );

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="bold"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="adm-db-wrapper">
      <div className="adm-db-header">
        <div>
          <h1>
            Welcome, {user?.name || "Admin"} <Hand size={18} />
          </h1>
          <p>{new Date().toDateString()}</p>
        </div>
      </div>

      <div className="adm-stats-grid">
        {statCards.map((item, i) => (
          <div key={i} className="adm-stat-card">
            <div className={`adm-stat-icon ${item.iconBgClass}`}>
              <item.icon color={item.iconColor} size={26} />
            </div>
            <div className="adm-stat-info">
              <p>{item.title}</p>
              <h3>{item.count}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-charts-row">
        <div className="adm-chart-card">
          <h3 className="adm-chart-title">Doctor Gender Distribution</h3>
          {visibleDoctorGenderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={visibleDoctorGenderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  isAnimationActive={false}
                >
                  {visibleDoctorGenderData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS_GENDER[index % COLORS_GENDER.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No doctor gender data available.</p>
          )}
        </div>

        <div className="adm-chart-card">
          <h3 className="adm-chart-title">Patient Gender Distribution</h3>
          {visiblePatientGenderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={visiblePatientGenderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  isAnimationActive={false}
                >
                  {visiblePatientGenderData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS_GENDER[index % COLORS_GENDER.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No patient gender data available.</p>
          )}
        </div>

        <div className="adm-chart-card adm-chart-wide">
          <h3 className="adm-chart-title">Appointment Status Overview</h3>
          {visibleAppointmentStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={visibleAppointmentStatusData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                >
                  {visibleAppointmentStatusData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS_STATUS[index % COLORS_STATUS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No appointment status data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
