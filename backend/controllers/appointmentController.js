const Appointment = require("../Models/Appointment");

const bookAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      timeSlot,
      symptoms,
      duration,
      checkupType,
      fee,
    } = req.body;

    console.log("📅 Appointment Booking Request:", {
      patientId,
      doctorId,
      patientName,
      appointmentDate,
      timeSlot,
    });

    if (!appointmentDate || !doctorId || !patientId || !timeSlot) {
      console.log("❌ Validation Error - Missing fields");
      return res.status(400).json({
        message:
          "Missing required fields: Date, Doctor, Patient ID, or Time Slot",
      });
    }

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      patientName: patientName || "Unknown Patient",
      patientEmail: patientEmail || "",
      patientPhone: patientPhone || "",
      appointmentDate,
      timeSlot,
      symptoms: symptoms || "",
      duration: duration || "",
      checkupType: checkupType || "General",
      consultationFee: fee || 500,
    });

    await newAppointment.save();
    console.log("✅ Appointment Booked Successfully:", newAppointment._id);
    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("❌ Appointment Booking Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

const getDoctorEarnings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({
      doctorId: doctorId,
      status: "Approved",
    }).sort({ createdAt: -1 });

    const total = appointments.reduce(
      (sum, item) => sum + (Number(item.consultationFee) || 0),
      0,
    );

    res.status(200).json({
      totalEarnings: `₹${total.toLocaleString()}`,
      transactions: appointments.map((app) => ({
        id: app._id.toString().slice(-6).toUpperCase(),
        patient: app.patientName,
        date: app.appointmentDate,
        amount: `₹${app.consultationFee}`,
        status: "Paid",
        method: "Online",
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching earnings" });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const { patientId, doctorId, summary } = req.query;
    const query = {};

    if (patientId) {
      query.patientId = patientId;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    const selection =
      summary === "1"
        ? "patientId doctorId patientName patientEmail patientPhone appointmentDate timeSlot consultationFee status doctorNote createdAt"
        : null;

    const appointments = await Appointment.find(query)
      .select(selection)
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor appointments" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    res.status(200).json({ message: "Updated", updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

const updateDoctorNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorNote } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { doctorNote: doctorNote.trim() },
      { returnDocument: "after" },
    );
    res.status(200).json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

module.exports = {
  bookAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getDoctorEarnings,
  updateStatus,
  updateDoctorNote,
  deleteAppointment,
};
