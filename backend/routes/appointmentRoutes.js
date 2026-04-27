const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

router.post("/book", appointmentController.bookAppointment);
router.get("/all", appointmentController.getAllAppointments);
router.get("/doctor/:doctorId", appointmentController.getDoctorAppointments);
router.get("/earnings/:doctorId", appointmentController.getDoctorEarnings); 
router.put("/status/:id", appointmentController.updateStatus);
router.put("/doctor-note/:id", appointmentController.updateDoctorNote);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;
