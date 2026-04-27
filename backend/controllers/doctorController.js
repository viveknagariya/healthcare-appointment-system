const validator = require("validator");
const bcrypt = require("bcryptjs");
const doctorModel = require("../Models/DoctorModel");
const fs = require("fs");
const path = require("path");

const seedDataPath = path.join(__dirname, "..", "data.json");

const normalizeEmail = (value = "") => value.toLowerCase().trim();

const getSeedDoctorPassword = (email) => {
  try {
    if (!fs.existsSync(seedDataPath)) {
      return null;
    }

    const raw = fs.readFileSync(seedDataPath, "utf-8");
    const doctors = JSON.parse(raw);

    if (!Array.isArray(doctors)) {
      return null;
    }

    const matchedDoctor = doctors.find(
      (doctor) => normalizeEmail(doctor.email) === normalizeEmail(email),
    );

    return matchedDoctor?.password || null;
  } catch (error) {
    console.error("Seed password lookup failed:", error.message);
    return null;
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      specialization,
      qualification,
      experienceYears,
      phone,
      address,
      dob,
      regNumber,
      regCouncil,
      gender,
      currentWorkplace,
      shift,
    } = req.body;

    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Documents Missing",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }

    const doctorExists = await doctorModel.findOne({
      email: normalizeEmail(email),
    });
    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: "Doctor already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = new doctorModel({
      fullName,
      email: normalizeEmail(email),
      password: hashedPassword,
      visiblePassword: password,
      specialization,
      qualification,
      experienceYears,
      phone,
      address,
      gender,
      dob,
      regNumber,
      regCouncil,
      currentWorkplace,
      shift: shift || "Day",
      image: files.profileImg[0].path,
      degreeCertificate: files.degreeDoc[0].path,
      identityProof: files.idProof[0].path,
      registrationCertificate: files.regDoc[0].path,
      cvFile: files.cvDoc[0].path,
      status: "Pending",
    });

    await newDoctor.save();

    res.json({
      success: true,
      message: "Doctor Registered. Waiting for Admin Approval.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Registration Failed",
      error: error.message,
    });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await doctorModel.findByIdAndUpdate(
      req.params.id,
      { status: "Active" },
      { returnDocument: "after", runValidators: false },
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      message: "Doctor approved successfully",
      doctor,
    });
  } catch (error) {
    console.error("Approve Doctor Error:", error);
    res.status(500).json({
      success: false,
      message: "Doctor approval failed",
    });
  }
};

exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const doctor = await doctorModel.findOne({
      email: { $regex: new RegExp("^" + normalizedEmail + "$", "i") },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const isApproved = !doctor.status || ["Active", "Approved"].includes(doctor.status);

    if (!isApproved) {
      return res.status(403).json({
        success: false,
        message: "Doctor not approved yet",
      });
    }

    let isMatch = false;

    if (doctor.password && doctor.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, doctor.password);
    } else {
      isMatch = password === doctor.password;
    }

    if (!isMatch && doctor.visiblePassword) {
      isMatch = password === doctor.visiblePassword;
    }

    let shouldRepairPassword = false;

    if (!isMatch) {
      const seedPassword = getSeedDoctorPassword(normalizedEmail);

      if (seedPassword && password === seedPassword) {
        isMatch = true;
        shouldRepairPassword = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!doctor.visiblePassword || shouldRepairPassword) {
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(password, salt);
      doctor.visiblePassword = password;
      await doctor.save();
    }

    res.json({
      success: true,
      message: "Login Successful",
      doctor,
    });
  } catch (error) {
    console.error("Doctor Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Login Failed",
    });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim();
    }

    const existingDoctor = await doctorModel.findById(req.params.id);
    if (!existingDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    let isProfileChanged = false;
    const fieldsToWatch = [
        "fullName", "email", "phone", "specialization", "qualification",
        "experienceYears", "address", "currentWorkplace", "shift"
    ];

    for (const field of fieldsToWatch) {
      if (req.body[field] !== undefined && String(req.body[field]) !== String(existingDoctor[field])) {
        isProfileChanged = true;
        break;
      }
    }

    if (isProfileChanged) {
      req.body.status = "Pending";
    }

    if (req.body.isFromPortal) {
        req.body.status = "Pending";
    }

    if (req.body.password && !req.body.password.startsWith("$2")) {
      req.body.visiblePassword = req.body.password;
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } else if (req.body.password === "") {
        delete req.body.password;
    }

    const updated = await doctorModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );

    res.json({
      success: true,
      message: "Doctor Updated Successfully",
      doctor: updated,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Update Failed",
    });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const filesToDelete = [
      doctor.image,
      doctor.degreeCertificate,
      doctor.identityProof,
      doctor.registrationCertificate,
      doctor.cvFile,
    ];

    filesToDelete.forEach((file) => {
      if (file) {
        const filePath = path.join(__dirname, "..", file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await doctorModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Doctor and all associated documents deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during deletion" });
  }
};
