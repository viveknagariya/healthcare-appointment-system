const Inquiry = require("../Models/Inquiry");

exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, msg: "All fields are required." });
    }

    const newInquiry = new Inquiry({ name, email, message });
    await newInquiry.save();

    res.status(201).json({ success: true, msg: "Inquiry submitted successfully!" });
  } catch (error) {
    console.error("Inquiry Submit Error:", error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error("Fetch Inquiries Error:", error);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Inquiry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Delete failed" });
  }
};
