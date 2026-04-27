const express = require("express");
const router = express.Router();
const multer = require("multer");
const Patient = require("../Models/Patient");
const adminController = require("../controllers/adminController");

router.post("/login", adminController.loginAdmin);
router.post("/register", adminController.registerAdmin);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

router.delete("/patients/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Patient removed" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

router.put(
  "/patients/:id",
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  async (req, res) => {
    try {
      const updatedData = { ...req.body };
      const updated = await Patient.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true },
      );
      res.json({ success: true, user: updated });
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  },
);

module.exports = router;
