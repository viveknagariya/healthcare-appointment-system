const express = require("express");
const router = express.Router();
const inquiryController = require("../controllers/inquiryController");

router.post("/submit", inquiryController.submitInquiry);

router.get("/all", inquiryController.getAllInquiries);
router.delete("/delete/:id", inquiryController.deleteInquiry);

module.exports = router;
