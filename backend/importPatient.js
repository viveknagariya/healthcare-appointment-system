const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const csv = require("csv-parser");

const Patient = require("./Models/Patient");

mongoose
  .connect("mongodb://127.0.0.1:27017/mediq")
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.log(" DB Error:", err));

const uploadFolder = path.join(__dirname, "uploads/patients");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function loadCSV(file) {
  return new Promise((resolve) => {
    const results = [];

    fs.createReadStream(file)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results));
  });
}

async function importPatients(fileName) {
  try {
    const ext = path.extname(fileName);

    let patients = [];

    if (ext === ".json") {
      patients = loadJSON(fileName);
    } else if (ext === ".csv") {
      patients = await loadCSV(fileName);
    } else {
      console.log(" Only JSON or CSV supported");
      process.exit();
    }

    for (let p of patients) {
      const existingPatient = await Patient.findOne({ number: p.number });

      if (existingPatient) {
        console.log(` Skipped (Exists): ${p.number}`);
        continue;
      }

      const imageName = Date.now() + "_" + path.basename(p.profileImg);

      const destination = path.join(uploadFolder, imageName);

      if (!fs.existsSync(p.profileImg)) {
        console.log(` Image not found: ${p.profileImg}`);
        continue;
      }

      fs.copyFileSync(p.profileImg, destination);

      await Patient.create({
        name: p.name,
        number: p.number,
        gender: p.gender,
        profilePic: "uploads/patients/" + imageName,
      });

      console.log(` Imported: ${p.name}`);
    }

    console.log("\n All Patients Imported!");
    process.exit();
  } catch (error) {
    console.error(" Import Error:", error);
    process.exit(1);
  }
}

const filePath = path.join(__dirname, "patient.csv");

importPatients(filePath);
