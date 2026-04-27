const express = require("express");
const router = express.Router();
const Patient = require("../Models/Patient");
const patientController = require("../controllers/patientController");
const { patientUpload } = require("../middleware/multer");

router.post("/register", patientUpload, async (req, res) => {
  try {
    const { name, number, gender } = req.body;
    const existing = await Patient.findOne({ number });
    if (existing)
      return res
        .status(400)
        .json({ success: false, error: "Number already registered!" });

    const patient = new Patient({
      name,
      number,
      gender,
      profilePic: req.file ? `uploads/patients/${req.file.filename}` : "",
    });
    await patient.save();
    res.json({ success: true, user: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: "Registration failed." });
  }
});

router.post("/check-user", async (req, res) => {
  try {
    const patient = await Patient.findOne({ number: req.body.number });
    res.json({ exists: !!patient });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const patient = await Patient.findOne({ number: req.body.number });
    if (!patient) return res.json({ success: false, error: "User not found." });
    res.json({ success: true, user: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: "Login failed." });
  }
});

router.get("/patients", patientController.getAllPatients);
router.get("/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

router.delete("/patient/:id", patientController.deletePatient);
router.put("/patients/:id", patientController.updatePatient);

module.exports = router;
