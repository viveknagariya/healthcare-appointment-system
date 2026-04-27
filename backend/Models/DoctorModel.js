const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    visiblePassword: { type: String },
    address: { type: String, required: true },
    regNumber: { type: String, required: true },
    regCouncil: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    currentWorkplace: { type: String, required: true },

    shift: {
      type: String,
      enum: ["Day", "Night"],
      required: [true, "Please select your work shift (Day/Night)"],
      default: "Day",
    },

    image: { type: String, required: true },
    degreeCertificate: { type: String, required: true },
    registrationCertificate: { type: String, required: true },
    identityProof: { type: String, required: true },
    cvFile: { type: String, required: true },
    date: { type: Number, default: Date.now },
    status: { type: String, default: "Pending" },
  },
  { minimize: false },
);

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

module.exports = doctorModel;
