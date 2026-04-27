import React, { useEffect, useState, useRef } from "react";
import {
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Users,
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import "./DoctorDashboard.css";
import { useAuthUser } from "../../Services/useAuthUser";

const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

const DoctorDashboard = () => {
  const { user, loadingForSession } = useAuthUser();
  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPt, setSelectedPt] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    earningsToday: 0,
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToastMsg = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      5002,
    );
  };

  const selectedPtRef = useRef(null);
  const patientsRef = useRef([]);
  const appointmentsRef = useRef([]);
  const scrollRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    selectedPtRef.current = selectedPt;
  }, [selectedPt]);

  useEffect(() => {
    patientsRef.current = patients;
  }, [patients]);

  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  useEffect(() => {
    if (user != null && !loadingForSession) {
      const userId = user?.userId || null;

      if (userId) {
        if (!socket.connected) {
          socket.connect();
        }

        socket.emit("join_room", userId);

        const handleReceiveMessage = async (data) => {
          if (
            selectedPtRef.current &&
            selectedPtRef.current._id === data.senderId
          ) {
            setMessages((prev) => [...prev, data]);
          } else {
            setUnreadCounts((prev) => ({
              ...prev,
              [data.senderId]: (prev[data.senderId] || 0) + 1,
            }));
          }

          setPatients((prevPts) => {
            const ptIndex = prevPts.findIndex((p) => p._id === data.senderId);
            if (ptIndex > -1) {
              const pt = {
                ...prevPts[ptIndex],
                lastMessage: data.message,
                timestamp: new Date().toISOString(),
              };
              const newList = [...prevPts];
              newList.splice(ptIndex, 1);
              newList.unshift(pt);
              return newList;
            }
            return prevPts;
          });

          const patientExists = patientsRef.current.some(
            (p) => p._id === data.senderId,
          );
          if (!patientExists && data.senderModel === "Patient") {
            try {
              const res = await axios.get(
                `http://localhost:5000/api/patients/${data.senderId}`,
              );
              const incomingPatient = res.data || {};

              if (incomingPatient._id) {
                setPatients((prevPts) => {
                  if (prevPts.some((p) => p._id === incomingPatient._id)) {
                    return prevPts;
                  }

                  return [
                    {
                      ...incomingPatient,
                      lastMessage: data.message,
                      timestamp: new Date().toISOString(),
                    },
                    ...prevPts,
                  ];
                });
              }
            } catch (error) {
              console.log("Error loading incoming patient", error);
            }
          }
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
          socket.off("receive_message", handleReceiveMessage);
        };
      }
    }
  }, [user, loadingForSession]);

  useEffect(() => {
    if (user != null && !loadingForSession) {
      const userId = user?.userId || null;

      if (userId) {
        Promise.all([
          axios.get(`http://localhost:5000/api/doctors/profile/${userId}`),
          axios.get(`http://localhost:5000/api/appointments/doctor/${userId}`),
          axios.get(`http://localhost:5000/api/chat/metadata/${userId}`),
        ])
          .then(async ([doctorRes, appointmentsRes, metaRes]) => {
            const doctorData = doctorRes.data || {};
            const appointmentData = appointmentsRes.data || [];
            const meta = metaRes.data.data || [];

            setDoctor(doctorData);
            setAppointments(appointmentData);

            const today = new Date().toISOString().split("T")[0];
            const patientIds = new Set();
            let todayCount = 0;
            let earnings = 0;

            appointmentData.forEach((apt) => {
              if (!apt) return;
              const pId = apt.patientId?._id || apt.patientId;
              if (pId) patientIds.add(pId.toString().trim());
              if (apt.appointmentDate?.includes(today)) {
                todayCount++;
                earnings += apt.consultationFee || 0;
              }
            });

            meta.forEach((item) => {
              if (item.otherUserId) {
                patientIds.add(item.otherUserId.toString().trim());
              }
            });

            setStats({
              totalPatients: patientIds.size,
              todayAppointments: todayCount,
              earningsToday: earnings,
            });

            if (patientIds.size === 0) {
              setPatients([]);
              return;
            }

            const ptRes = await axios.get(
              `http://localhost:5000/api/patients?compact=1&ids=${Array.from(patientIds).join(",")}`,
            );

            const pts = ptRes.data || [];
            const metaMap = {};
            meta.forEach((m) => (metaMap[m.otherUserId] = m));

            const filteredPts = pts
              .map((p) => ({
                ...p,
                lastMessage: metaMap[p._id]?.lastMessage || "",
                timestamp: metaMap[p._id]?.timestamp || null,
              }))
              .sort((a, b) => {
                if (a.timestamp && b.timestamp) {
                  return new Date(b.timestamp) - new Date(a.timestamp);
                }
                if (a.timestamp) return -1;
                if (b.timestamp) return 1;
                return 0;
              });

            setPatients(filteredPts);
          })
          .catch((err) => {
            console.log("Error fetching dashboard data", err);
            setDoctor({});
            setPatients([]);
          });
      }
    }
  }, [user, loadingForSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedPt) {
      chatWindowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedPt]);

  const openChat = async (pt) => {
    setSelectedPt(pt);
    setUnreadCounts((prev) => ({ ...prev, [pt._id]: 0 }));
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/messages/${pt._id}/${user?.userId}`,
      );
      setMessages(res.data.data || []);
    } catch {
      setMessages([]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedPt) return;

    try {
      const res = await axios.post("http://localhost:5000/api/chat/send", {
        senderId: user?.userId,
        senderModel: "Doctor",
        receiverId: selectedPt._id,
        receiverModel: "Patient",
        message: newMsg.trim(),
      });
      if (res.data.success) {
        const newMsgData = res.data.data;
        setMessages([...messages, newMsgData]);
        setNewMsg("");

        socket.emit("send_message", newMsgData);

        setPatients((prevPts) => {
          const ptIndex = prevPts.findIndex((p) => p._id === selectedPt._id);
          if (ptIndex > -1) {
            const pt = {
              ...prevPts[ptIndex],
              lastMessage: newMsgData.message,
              timestamp: new Date().toISOString(),
            };
            const newList = [...prevPts];
            newList.splice(ptIndex, 1);
            newList.unshift(pt);
            return newList;
          }
          return prevPts;
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!patientId) return;
    const pidString = patientId.toString().trim();
    if (
      window.confirm(
        "Are you sure you want to delete this patient? This will remove all their data and appointments from the system.",
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/patient/${pidString}`);

        setAppointments((prev) =>
          prev.filter((apt) => {
            const appId = (apt.patientId?._id || apt.patientId)
              ?.toString()
              .trim();
            return appId !== pidString;
          }),
        );
        showToastMsg("Patient deleted successfully!");
      } catch (err) {
        console.error("Delete failed", err);
        showToastMsg("Failed to delete patient.", "error");
      }
    }
  };

  const statusCounts = appointments.reduce((acc, apt) => {
    const status = apt.status || "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusChartData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
  }));

  const patientById = new Map(
    patients.map((p) => [p._id?.toString().trim(), p]),
  );
  const patientByNumber = new Map(
    patients.map((p) => [p.number?.toString().trim(), p]),
  );
  const patientByName = new Map(
    patients.map((p) => [p.name?.toString().trim().toLowerCase(), p]),
  );

  const normalizeGender = (value) => {
    const rawG = (value || "Unknown").toString().trim().toLowerCase();
    if (rawG === "m") return "Male";
    if (rawG === "f") return "Female";
    return rawG.charAt(0).toUpperCase() + rawG.slice(1);
  };

  const seenPatients = new Set();
  const genderCounts = appointments.reduce(
    (acc, apt) => {
      const patientId = apt.patientId?._id || apt.patientId;
      const patientKey =
        patientId?.toString().trim() ||
        apt.patientPhone?.toString().trim() ||
        apt.patientName?.toString().trim().toLowerCase();

      if (!patientKey || seenPatients.has(patientKey)) {
        return acc;
      }
      seenPatients.add(patientKey);

      const matchedPatient =
        patientById.get(patientId?.toString().trim()) ||
        patientByNumber.get(apt.patientPhone?.toString().trim()) ||
        patientByName.get(apt.patientName?.toString().trim().toLowerCase());

      const normalizedGender = normalizeGender(matchedPatient?.gender);
      acc[normalizedGender] = (acc[normalizedGender] || 0) + 1;
      return acc;
    },
    { Male: 0, Female: 0 },
  );

  const genderChartData = [
    { name: "Male", value: genderCounts.Male || 0 },
    { name: "Female", value: genderCounts.Female || 0 },
    ...Object.keys(genderCounts)
      .filter((g) => !["Male", "Female"].includes(g) && genderCounts[g] > 0)
      .map((g) => ({
        name: g,
        value: genderCounts[g],
      })),
  ];

  const GENDER_COLORS_MAP = {
    Male: "#3B82F6",
    Female: "#EC4899",
    Other: "#8B5CF6",
    Unknown: "#9CA3AF",
  };

  const last7Days = [...Array(7)]
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    })
    .reverse();

  const earningsChartData = last7Days.map((date) => {
    const dailyTotal = appointments
      .filter((apt) => apt.appointmentDate?.includes(date))
      .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);
    return { name: date.slice(5), earnings: dailyTotal };
  });

  const COLORS = ["#4F46E5", "#10B981", "#FBBF24", "#EF4444", "#8B5CF6"];

  return (
    <div className="drdb-wrapper">
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
            className="drdb-toast-close"
          />
          <div className="toast-timer-line run-5s"></div>
        </div>
      )}

      <h1 className="drdb-title">
        Welcome Back, <span>{doctor.fullName || "Doctor"}</span>
      </h1>
      <div className="drdb-shift">
        Shift: <strong>{doctor.shift || "Day"}</strong>
      </div>

      <div className="drdb-stats">
        <div className="drdb-card">
          <Users size={22} />
          <p>{stats.totalPatients}</p>
          <span>Total Patients</span>
        </div>
        <div className="drdb-card">
          <CalendarDays size={22} />
          <p>{stats.todayAppointments}</p>
          <span>Today Appointments</span>
        </div>
        <div className="drdb-card">
          <IndianRupee size={22} />
          <p>{stats.earningsToday}</p>
          <span>Today Earnings</span>
        </div>
      </div>

      <div className="drdb-charts-row">
        <div className="drdb-chart-container">
          <h3>Appointments Status</h3>
          <div className="drdb-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy={90}
                  innerRadius={50}
                  outerRadius={75}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="drdb-chart-container">
          <h3>Patient Gender Distribution</h3>
          <p className="drdb-chart-note">
            Based on all registered patients.
          </p>
          <div className="drdb-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy={90}
                  innerRadius={50}
                  outerRadius={75}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {genderChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        GENDER_COLORS_MAP[entry.name] ||
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="drdb-chart-container">
          <h3>Weekly Earnings (INR)</h3>
          <div className="drdb-earnings-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="drdb-main">
        <div className="drdb-left-column">
          <div className="drdb-table-box">
            <h2>Recent Appointments</h2>
            <div className="drdb-table-responsive">
              <table className="drdb-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Fee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt._id}>
                      <td>{apt.patientName || "-"}</td>
                      <td>
                        {apt.appointmentDate
                          ? new Date(apt.appointmentDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>{apt.timeSlot || "-"}</td>
                      <td>{apt.status || "-"}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <IndianRupee size={14} />
                          {apt.consultationFee || 0}
                        </span>
                      </td>
                      <td>
                        <button
                          className="drdb-delete-btn"
                          onClick={() =>
                            handleDeletePatient(
                              apt.patientId?._id || apt.patientId,
                            )
                          }
                          title="Delete Patient"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedPt && (
            <div className="drdb-chat-window" ref={chatWindowRef}>
              <div className="drdb-chat-header">
                <span>
                  Chatting with:{" "}
                  <strong>{selectedPt.name || selectedPt.fullName}</strong>
                </span>
                <button onClick={() => setSelectedPt(null)}>Close Chat</button>
              </div>
              <div className="drdb-chat-body" ref={scrollRef}>
                {messages.length > 0 ? (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`drdb-msg ${m.senderModel === "Doctor" ? "me" : "other"}`}
                    >
                      {m.message}
                    </div>
                  ))
                ) : (
                  <p className="drdb-chat-empty">
                    No messages yet.
                  </p>
                )}
              </div>
              <form className="drdb-chat-input" onSubmit={handleSend}>
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
          )}
        </div>

        <div className="drdb-right">
          <div className="drdb-card-box drdb-chat-list-container">
            <h3>Patient Chats</h3>
            <div className="drdb-chat-list">
              {patients.length > 0 ? (
                patients.map((pt) => {
                  const isActive = selectedPt?._id === pt._id;
                  return (
                    <div
                      key={pt._id}
                      className={`drdb-pt-card ${isActive ? "active" : ""}`}
                      onClick={() => openChat(pt)}
                    >
                      <div className="drdb-doc-info">
                        <strong>{pt.name || pt.fullName}</strong>
                        <span className="drdb-role">
                          {pt.number || pt.phone}
                        </span>
                        {pt.lastMessage && (
                          <span className="drdb-snippet">
                            {pt.lastMessage.length > 25
                              ? `${pt.lastMessage.substring(0, 25)}...`
                              : pt.lastMessage}
                          </span>
                        )}
                      </div>
                      {unreadCounts[pt._id] > 0 && (
                        <div className="drdb-unread-badge">
                          {unreadCounts[pt._id]}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No patients found</p>
              )}
            </div>
          </div>

          <div className="drdb-card-box">
            <h3>Doctor Info</h3>
            <div className="drdb-grid">
              <div>
                <span>Name</span>
                <p>{doctor.fullName || "-"}</p>
              </div>
              <div>
                <span>Spec.</span>
                <p>{doctor.specialization || "-"}</p>
              </div>
              <div>
                <span>Exp.</span>
                <p>{doctor.experienceYears || 0} yrs</p>
              </div>
              <div>
                <span>Shift</span>
                <p>{doctor.shift || "Day"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
