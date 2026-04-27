const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const csv = require("csv-parser");

const doctorModel = require("./Models/DoctorModel");

mongoose
  .connect("mongodb://127.0.0.1:27017/mediq")
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.log(" DB Error:", err));

const uploadFolder = path.join(__dirname, "uploads");

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

async function importDoctors(fileName) {
  try {
    const ext = path.extname(fileName);

    let doctors = [];

    if (ext === ".json") {
      doctors = loadJSON(fileName);
    } else if (ext === ".csv") {
      doctors = await loadCSV(fileName);
    } else {
      console.log(" Only JSON or CSV supported");
      process.exit();
    }

    for (let doc of doctors) {
      const emailExists = await doctorModel.findOne({ email: doc.email });

      if (emailExists) {
        console.log(` Skipped Email Exists: ${doc.email}`);
        continue;
      }

      const regExists = await doctorModel.findOne({ regNumber: doc.regNumber });

      if (regExists) {
        console.log(` Skipped Reg Exists: ${doc.regNumber}`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(doc.password, salt);

      const profileName = Date.now() + "_" + path.basename(doc.profileImg);
      const degreeName = Date.now() + "_" + path.basename(doc.degreeDoc);
      const idName = Date.now() + "_" + path.basename(doc.idProof);
      const regName = Date.now() + "_" + path.basename(doc.regDoc);
      const cvName = Date.now() + "_" + path.basename(doc.cvDoc);

      fs.copyFileSync(doc.profileImg, path.join(uploadFolder, profileName));
      fs.copyFileSync(doc.degreeDoc, path.join(uploadFolder, degreeName));
      fs.copyFileSync(doc.idProof, path.join(uploadFolder, idName));
      fs.copyFileSync(doc.regDoc, path.join(uploadFolder, regName));
      fs.copyFileSync(doc.cvDoc, path.join(uploadFolder, cvName));

      await doctorModel.create({
        fullName: doc.fullName,
        email: doc.email,
        phone: doc.phone,
        dob: new Date(doc.dob),
        gender: doc.gender,
        specialization: doc.specialization,
        qualification: doc.degree,
        experienceYears: doc.experienceYears,
        address: doc.state,
        regNumber: doc.regNumber,
        regCouncil: doc.regCouncil,
        currentWorkplace: doc.currentWorkplace,
        password: hashedPassword,
        visiblePassword: doc.password,
        shift: doc.shift || "Day",
        status: "Pending",

        image: "uploads/" + profileName,
        degreeCertificate: "uploads/" + degreeName,
        identityProof: "uploads/" + idName,
        registrationCertificate: "uploads/" + regName,
        cvFile: "uploads/" + cvName,
      });

      console.log(`Imported: ${doc.fullName}`);
    }

    console.log("\n Doctors Import Completed");
    process.exit();
  } catch (error) {
    console.error(" Import Error:", error);
    process.exit(1);
  }
}

const filePath = path.join(__dirname, "data.json");


importDoctors(filePath);
