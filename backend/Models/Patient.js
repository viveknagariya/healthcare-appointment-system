const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    weight: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Patient", patientSchema);
