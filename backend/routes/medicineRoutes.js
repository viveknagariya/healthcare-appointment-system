const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");

router.post("/chat/ai-chat", medicineController.getMedicineBySymptom);

router.get("/all", medicineController.getAllMedicines);
router.post("/add", medicineController.addMedicine);

module.exports = router;
