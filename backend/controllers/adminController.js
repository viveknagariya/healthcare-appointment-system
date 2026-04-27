const bcrypt = require("bcryptjs");
const Admin = require("../Models/Admin");

exports.seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      const defaultAdmin = new Admin({
        name: "Admin",
        adminId: "admin@mediq",
        password: hashedPassword,
        role: "SuperAdmin",
      });
      await defaultAdmin.save();
      console.log("Seeded default Admin: admin@mediq / admin123");
    }
  } catch (err) {
    console.error("Error seeding admin", err);
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    const admin = await Admin.findOne({ adminId });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Invalid Admin ID" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    }

    res.json({
      success: true,
      message: "Admin Login Successful",
      admin,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { name, adminId, password, role } = req.body;

    const exists = await Admin.findOne({ adminId });
    if (exists) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      adminId,
      password: hashedPassword,
      role: role || "SubAdmin",
    });

    await newAdmin.save();

    res.json({ success: true, message: "Admin Registered successfully", admin: newAdmin });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};
