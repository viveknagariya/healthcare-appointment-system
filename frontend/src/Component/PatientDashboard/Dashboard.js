import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Calendar,
  Activity,
  CalendarDays,
  Clock3,
  ArrowLeft,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "./Dashboard.css";
import { useAuthUser } from "../../Services/useAuthUser";

const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

const normalizeAppointments = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.appointments)) return responseData.appointments;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const Dashboard = () => {
  const { user } = useAuthUser();
  const [doctors, setDoctors] = useState([]);
  const [selectedDr, setSelectedDr] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [patient, setPatient] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ totalApts: 0, upcomingApts: 0 });
  const [chartData, setChartData] = useState([]);
  const selectedDrRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    selectedDrRef.current = selectedDr;
  }, [selectedDr]);
  useEffect(() => {
    if (user != null) {
      const userId = user?.userId || null;


      Promise.all([
        axios.get("http://localhost:5000/api/doctors/all?summary=1"),
        axios.get(`http://localhost:5000/api/chat/metadata/${userId}`),
      ])
        .then(([docRes, metaRes]) => {
          const docs = docRes.data.doctors || [];
          const meta = metaRes.data.data || [];

          const metaMap = {};
          meta.forEach((m) => (metaMap[m.otherUserId] = m));

          const enhancedDocs = docs.map((d) => ({
            ...d,
            lastMessage: metaMap[d._id]?.lastMessage || "",
            timestamp: metaMap[d._id]?.timestamp || null,
          }));

          enhancedDocs.sort((a, b) => {
            if (a.timestamp && b.timestamp)
              return new Date(b.timestamp) - new Date(a.timestamp);
            if (a.timestamp) return -1;
            if (b.timestamp) return 1;
            return 0;
          });

          setDoctors(enhancedDocs);
        })
        .catch(() => setDoctors([]));

      axios
        .get(`http://localhost:5000/api/patients/${userId}`)
        .then((res) => {
          setPatient(res.data || {});
        })
        .catch((err) => console.log(err));

      axios
        .get(`http://localhost:5000/api/appointments/all?patientId=${userId}&summary=1`)
        .then((res) => {
          const myAppts = normalizeAppointments(res.data);

          const today = new Date().toISOString().split("T")[0];
          let upcoming = 0;
          myAppts.forEach((apt) => {
            if (
              apt.appointmentDate >= today &&
              apt.status !== "Cancelled" &&
              apt.status !== "Completed"
            ) {
              upcoming++;
            }
          });

          const pendingCount = myAppts.filter(
            (a) => (a.status || "Pending") === "Pending",
          ).length;
          const approvedCount = myAppts.filter(
            (a) => a.status === "Approved",
          ).length;
          const cancelledCount = myAppts.filter(
            (a) => a.status === "Cancelled",
          ).length;

          setChartData([
            { name: "Pending", value: pendingCount },
            { name: "Approved", value: approvedCount },
            { name: "Cancelled", value: cancelledCount },
          ].filter((item) => item.value > 0));

          setAppointments(myAppts);
          setStats({
            totalApts: myAppts.length,
            upcomingApts: upcoming,
          });
        })
        .catch((err) => console.log(err));
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit("join_room", userId);

      const handleReceiveMessage = (data) => {
        if (
          selectedDrRef.current &&
          selectedDrRef.current._id === data.senderId
        ) {
          setChatHistory((prev) => [...prev, data]);
        } else {
          setUnreadCounts((prev) => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1,
          }));
        }

        setDoctors((prevDoctors) => {
          const docIndex = prevDoctors.findIndex((d) => d._id === data.senderId);
          if (docIndex > -1) {
            const doc = {
              ...prevDoctors[docIndex],
              lastMessage: data.message,
              timestamp: new Date().toISOString(),
            };
            const newList = [...prevDoctors];
            newList.splice(docIndex, 1);
            newList.unshift(doc);
            return newList;
          }
          return prevDoctors;
        });
      };

      socket.on("receive_message", handleReceiveMessage);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [user]);


  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const openChat = async (dr) => {
    setSelectedDr(dr);
    setUnreadCounts((prev) => ({ ...prev, [dr._id]: 0 }));
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/messages/${user?.userId || user?._id}/${dr._id}`,
      );
      setChatHistory(res.data.data || []);
    } catch {
      setChatHistory([]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!msg.trim() || !selectedDr || !user.userId) {
      console.log("Missing fields or not selected");
      return;
    }

    const payload = {
      senderId: user.userId,
      senderModel: "Patient",
      receiverId: selectedDr._id,
      receiverModel: "Doctor",
      message: msg.trim(),
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chat/send",
        payload,
      );

      if (res.data.success) {
        const newMsgData = res.data.data;
        setChatHistory((prev) => [...prev, newMsgData]);
        setMsg("");

        socket.emit("send_message", newMsgData);

        setDoctors((prevDoctors) => {
          const docIndex = prevDoctors.findIndex(
            (d) => d._id === selectedDr._id,
          );
          if (docIndex > -1) {
            const doc = {
              ...prevDoctors[docIndex],
              lastMessage: newMsgData.message,
              timestamp: new Date().toISOString(),
            };
            const newList = [...prevDoctors];
            newList.splice(docIndex, 1);
            newList.unshift(doc);
            return newList;
          }
          return prevDoctors;
        });
      } else {
        alert("Failed to send message");
      }
    } catch (err) {
      console.error("Send Error:", err);
      alert("Error sending message. Check console.");
    }
  };

  const formatDr = (name) => (name?.startsWith("Dr.") ? name : `Dr. ${name}`);

  const filteredDoctors = doctors.filter((dr) => {
    const query = doctorSearch.trim().toLowerCase();
    if (!query) return true;

    return (
      dr.fullName?.toLowerCase().includes(query) ||
      dr.specialization?.toLowerCase().includes(query)
    );
  });



  const CHART_COLORS = ["#FBBF24", "#10B981", "#EF4444"];

  return (
    <div className="ptx-main-layout">
      <div className="ptx-left">
        <h2>Patient Dashboard</h2>
        <div className="ptx-welcome">
          <p>
            Welcome back,{" "}
            <strong>{patient.name || patient.fullName || "User"}</strong>!
          </p>
        </div>

        <div className="ptx-stats-grid">
          <div className="ptx-stat-card">
            <Calendar size={28} color="#4F46E5" />
            <div>
              <h3>{stats.totalApts}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="ptx-stat-card">
            <Activity size={28} color="#FF6347" />
            <div>
              <h3>{stats.upcomingApts}</h3>
              <p>Upcoming Appointments</p>
            </div>
          </div>
        </div>

        <div className="ptx-dashboard-chart-section">
          <div className="ptx-chart-card">
            <h3>Appointment Status Overview</h3>
            {chartData.length > 0 ? (
              <div className="ptx-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip wrapperClassName="ptx-chart-tooltip" />
                    <Legend verticalAlign="bottom" height={36} />
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy={110}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="ptx-no-data">No appointment data to display.</p>
            )}
          </div>
        </div>

        <div className="ptx-appt-list-container">
          <h3>Recent Appointments</h3>
          {appointments.length > 0 ? (
            <div className="ptx-appt-list">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt._id} className="ptx-appt-card">
                  <div className="ptx-appt-header">
                    <strong>
                      {apt.doctorId?.fullName
                        ? formatDr(apt.doctorId.fullName)
                        : doctors.find(
                          (d) =>
                            d._id === (apt.doctorId?._id || apt.doctorId),
                        )?.fullName
                          ? formatDr(
                            doctors.find(
                              (d) =>
                                d._id === (apt.doctorId?._id || apt.doctorId),
                            )?.fullName,
                          )
                          : apt.doctor
                            ? formatDr(apt.doctor)
                            : "Dr. Unknown"}
                    </strong>
                    <span
                      className={`ptx-badge ${apt.status === "Approved" ? "bg-green" : apt.status === "Cancelled" ? "bg-red" : "bg-yellow"}`}
                    >
                      {apt.status || "Pending"}
                    </span>
                  </div>
                  <div className="ptx-appt-details">
                    <span>
                      <CalendarDays size={14} />{' '}
                      {new Date(apt.appointmentDate).toDateString()}
                    </span>
                    <span>
                      <Clock3 size={14} /> {apt.timeSlot}
                    </span>
                </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="ptx-no-data">No recent appointments.</p>
          )}
        </div>
      </div>

      <div className="ptx-chat-container">
        {!selectedDr ? (
          <>
            <div className="ptx-chat-header">Select Doctor</div>
            <div style={{ padding: "12px 12px 0" }}>
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search doctor..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #dbe2ea",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </div>
            <div className="ptx-doctor-list">
              {filteredDoctors.map((dr) => (
                <div
                  key={dr._id}
                  className="ptx-doctor-card"
                  onClick={() => openChat(dr)}
                >
                  <div className="ptx-doc-info">
                    <strong>{formatDr(dr.fullName)}</strong>
                    <span className="ptx-role">{dr.specialization}</span>
                    {dr.lastMessage && (
                      <span className="ptx-snippet">
                        {dr.lastMessage.length > 28
                          ? dr.lastMessage.substring(0, 28) + "..."
                          : dr.lastMessage}
                      </span>
                    )}
                  </div>
                  {unreadCounts[dr._id] > 0 && (
                    <div className="ptx-unread-badge">
                      {unreadCounts[dr._id]}
                    </div>
                  )}
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                <p className="ptx-no-data">No doctors found.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="ptx-chat-header">
              <span
                className="ptx-back-btn"
                onClick={() => setSelectedDr(null)}
              >
                <ArrowLeft size={18} />
              </span>
              <strong>{formatDr(selectedDr.fullName)}</strong>
            </div>

            <div className="ptx-chat-body">
              {chatHistory.length > 0 ? (
                chatHistory.map((m, i) => (
                  <div
                    key={i}
                    className={`ptx-msg ${m.senderModel === "Patient" ? "me" : "other"
                      }`}
                  >
                    {m.message}
                  </div>
                ))
              ) : (
                <p className="ptx-no-messages">No messages yet.</p>
              )}
              <div ref={scrollRef}></div>
            </div>

            <form className="ptx-input-box" onSubmit={handleSend}>
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Type message..."
                required
              />
              <button type="submit">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
