const Patient = require("../Models/Patient");

exports.getAllPatients = async (req, res) => {
  try {
    const compact = req.query.compact === "1";
    const ids = String(req.query.ids || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const query = ids.length > 0 ? { _id: { $in: ids } } : {};
    const selection = compact
      ? "name number gender profilePic createdAt updatedAt"
      : null;

    const patients = await Patient.find(query)
      .select(selection)
      .sort({ createdAt: -1 })
      .lean();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Database Fetch Error" });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const updatedUser = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Update failed on server" });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    const deleted = await Patient.findByIdAndDelete(patientId);

    const Appointment = require("../Models/Appointment");
    await Appointment.deleteMany({ patientId: patientId });

    if (!deleted) {
      return res.status(200).json({
        success: true,
        message: "Patient already removed or not found, but cleanup performed.",
      });
    }

    res.json({
      success: true,
      msg: "Patient and their appointments removed successfully.",
    });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, error: "Delete failed on server" });
  }
};
