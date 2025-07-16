const functions = require("firebase-functions");
const express = require("express");
const multer = require("multer");
const admin = require("firebase-admin");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json()); // ถ้ารับ json
app.use(express.urlencoded({ extended: true }));

admin.initializeApp({
  credential: admin.credential.cert(require("./bill-for--vj-mart-firebase-adminsdk-fbsvc-fa589be952.json")),
  storageBucket: "gs://bill-for--vj-mart.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const upload = multer({ dest: "/tmp/uploads" }); // Cloud Functions ใช้ /tmp

app.post(
  "/upload",
  upload.fields([
    { name: "invPdf", maxCount: 1 },
    { name: "invImg", maxCount: 1 },
    { name: "invPdfEmployee", maxCount: 1 },
    { name: "invImgEmployee", maxCount: 1 },
    { name: "checkpdf", maxCount: 1 },
    { name: "checkimg", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let docId = req.body.docId;
      if (Array.isArray(docId)) {
        docId = docId[docId.length - 1];
      }

      if (!docId || typeof docId !== "string" || docId.trim() === "") {
        return res.status(400).send("❌ Invalid docId");
      }

      const files = req.files;

      const uploadToFirebase = async (file, folder) => {
        const fileName = Date.now() + "_" + file.originalname;
        const dest = `${folder}/${fileName}`;
        await bucket.upload(file.path, {
          destination: dest,
          metadata: { contentType: file.mimetype },
        });
        fs.unlinkSync(file.path);
        const [url] = await bucket.file(dest).getSignedUrl({
          action: "read",
          expires: "03-09-2030",
        });
        return url;
      };

      const invPdfUrl = files.invPdf ? await uploadToFirebase(files.invPdf[0], "inv-pdf") : "";
      const invImgUrl = files.invImg ? await uploadToFirebase(files.invImg[0], "inv-img") : "";
      const invPdfEmployeeUrl = files.invPdfEmployee ? await uploadToFirebase(files.invPdfEmployee[0], "inv-employee-pdf") : "";
      const invImgEmployeeUrl = files.invImgEmployee ? await uploadToFirebase(files.invImgEmployee[0], "inv-employee-img") : "";
      const checkpdfUrl = files.checkpdf ? await uploadToFirebase(files.checkpdf[0], "check-pdf") : "";
      const checkimgUrl = files.checkimg ? await uploadToFirebase(files.checkimg[0], "check-img") : "";

      await db.collection("expenses").doc(docId).set(
        {
          invPdfUrl,
          invImgUrl,
          invPdfEmployeeUrl,
          invImgEmployeeUrl,
          checkpdfUrl,
          checkimgUrl,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      res.json({ invPdfUrl, invImgUrl, invPdfEmployeeUrl, invImgEmployeeUrl, checkpdfUrl, checkimgUrl });
    } catch (err) {
      console.error("❌ Upload Error:", err);
      res.status(500).send("Upload failed: " + err.message);
    }
  }
);

exports.api = functions.https.onRequest(app);
