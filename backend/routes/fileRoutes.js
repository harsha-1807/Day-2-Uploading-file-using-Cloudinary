const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer
// const storage = multer.memoryStorage(); // ❌ Temporary storage (should be fixed)
// const upload = multer({ storage });

const upload = multer({ storage: multer.memoryStorage() });



// File Upload API
// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     // const result = await cloudinary.uploader.upload(req.file.buffer); // ❌ Wrong method (students should fix)
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: "uploads", 
//     });

//     // Clean up temp file
//     fs.unlinkSync(filePath);


//     res.json({ url: result.secure_url });
//   } catch (error) {
//     res.status(500).json({ error: "Upload failed" });
//   }
// });
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${file64}`;

    const result = await cloudinary.uploader.upload(dataURI);

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error(" Upload Error:", err);
    res.status(500).json({ error: "Upload failed: " + err.message });
  }
});

module.exports = router;
