const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  symptom: String,
  adultMed: String,
  childMed: String,
  remedy: String,
  diet: String,
  daysLimit: Number,
});

module.exports = mongoose.model("Medicine", medicineSchema);
