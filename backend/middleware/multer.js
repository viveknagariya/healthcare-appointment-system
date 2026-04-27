const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../uploads");
const patientDir = path.join(__dirname, "../uploads/patients");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(patientDir)) {
  fs.mkdirSync(patientDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;

    if (req.body.fullName) {
      uploadPath = uploadsDir;
    }

    if (req.body.name && req.body.number) {
      uploadPath = patientDir;
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    let fileName = Date.now() + "-" + file.fieldname;

    if (file.fieldname === "profileImg") fileName = Date.now() + "-profile";
    if (file.fieldname === "degreeDoc") fileName = Date.now() + "-degree";
    if (file.fieldname === "idProof") fileName = Date.now() + "-id";
    if (file.fieldname === "regDoc") fileName = Date.now() + "-registration";
    if (file.fieldname === "cvDoc") fileName = Date.now() + "-cv";
    if (file.fieldname === "profilePic") fileName = Date.now() + "-patient";

    cb(null, fileName + ext);
  },
});

const upload = multer({ storage });

const doctorUpload = upload.fields([
  { name: "profileImg", maxCount: 1 },
  { name: "degreeDoc", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "regDoc", maxCount: 1 },
  { name: "cvDoc", maxCount: 1 },
]);

const patientUpload = upload.single("profilePic");

module.exports = {
  doctorUpload,
  patientUpload,
};
