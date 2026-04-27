const express = require("express");
const router = express.Router();
const { doctorUpload } = require("../middleware/multer");

const {
  registerDoctor,
  loginDoctor,
  updateDoctor,
  deleteDoctor,
  approveDoctor,
} = require("../controllers/doctorController");

const doctorModel = require("../Models/DoctorModel");


router.post("/register", doctorUpload, registerDoctor);
router.post("/login", loginDoctor);
router.get("/profile/:id", async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
});

router.put("/update/:id", updateDoctor);
router.delete("/delete/:id", deleteDoctor);
router.get("/all", async (req, res) => {
  try {
    const summary = req.query.summary === "1";
    const doctors = await doctorModel
      .find({ status: "Active" })
      .select(
        summary
          ? "fullName gender specialization experienceYears shift image qualification currentWorkplace consultationFee status"
          : "",
      )
      .lean();
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching doctors" });
  }
});

router.get("/random", async (req, res) => {
  try {
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : 3;

    const doctors = await doctorModel.aggregate([
      { $match: { status: "Active" } },
      { $sample: { size: limit } },
    ]);

    res.json(doctors);
  } catch (err) {
    res.status(500).json([]);
  }
});
router.get("/admin/all", async (req, res) => {
  try {
    const summary = req.query.summary === "1";
    const doctors = await doctorModel
      .find({})
      .select(
        summary
          ? "fullName gender specialization experienceYears shift image currentWorkplace status"
          : "",
      )
      .lean();
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching all doctors" });
  }
});
router.get("/filter/:shift", async (req, res) => {
  try {
    const { shift } = req.params;
    const doctors = await doctorModel.find({
      status: "Active",
      shift: shift,
    });

    res.json({
      success: true,
      selectedShift: shift,
      count: doctors.length,
      doctors,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error filtering doctors" });
  }
});
router.put("/approve/:id", approveDoctor);

module.exports = router;
