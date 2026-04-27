require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const net = require("net");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const adminRoute = require("./routes/adminRoute");
const appointmentRoutes = require("./routes/appointmentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const adminController = require("./controllers/adminController");

const app = express();
const server = http.createServer(app);
const DEFAULT_PORT = 5000;
const configuredPort = Number.parseInt(process.env.PORT, 10);
const initialPort = Number.isInteger(configuredPort)
  ? configuredPort
  : DEFAULT_PORT;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mediq";

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId);
  });

  socket.on("send_message", (data) => {
    io.to(data.receiverId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(" Disconnected:", socket.id);
  });
});

app.set("io", io);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "../frontend/public")));
app.use("/documents", express.static(path.join(__dirname, "documents")));
app.use("/storage", express.static(path.join(__dirname, "storage")));

mongoose
  .connect(mongoUri)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.log(" DB Error:", err));

app.use("/api/doctors", doctorRoutes);
app.use("/api", patientRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/inquiries", inquiryRoutes);
const findAvailablePort = (port) =>
  new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.log(` Port ${port} is already in use. Retrying on ${port + 1}...`);
        resolve(findAvailablePort(port + 1));
        return;
      }

      reject(error);
    });

    tester.once("listening", () => {
      tester.close(() => resolve(port));
    });

    tester.listen(port);
  });

const startServer = async () => {
  try {
    const port = await findAvailablePort(initialPort);

    server.listen(port, async () => {
      await adminController.seedAdmin();
      console.log(` Server running on ${port}`);
    });
  } catch (error) {
    console.error(" Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
