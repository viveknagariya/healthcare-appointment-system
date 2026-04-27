const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patientName: { type: String, required: true },

  patientEmail: { type: String, default: "" },
  patientPhone: { type: String, default: "" },

  appointmentDate: { type: String, required: true },
  timeSlot: { type: String, required: true },

  symptoms: { type: String, default: "" },
  duration: { type: String, default: "" },
  checkupType: { type: String, default: "General" },

  consultationFee: { type: Number, required: true },
  paymentStatus: { type: String, default: "Paid" },
  status: { type: String, default: "Pending" },
  doctorNote: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
