const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer
// const storage = multer.memoryStorage(); // ❌ Temporary storage (should be fixed)
// const upload = multer({ storage });
// Configure Multer with validation

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Processing middleware
const processImage = async (req, res, next) => {
  try {
    if (!req.file) return next();
    
    // Process image with Sharp
    const processedBuffer = await sharp(req.file.buffer)
      .resize(1200, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        mozjpeg: true
      })
      .toBuffer();

    // Replace original file buffer with processed buffer
    req.file.buffer = processedBuffer;
    req.file.mimetype = 'image/jpeg';
    req.file.originalname = `${Date.now()}.jpg`;

    next();
  } catch (err) {
    next(err);
  }
};

// const upload = multer({ storage: multer.memoryStorage() });


// router.post("/upload", upload.single("file"),processImage, async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const file64 = req.file.buffer.toString("base64");
//     const dataURI = `data:${req.file.mimetype};base64,${file64}`;

//     const result = await cloudinary.uploader.upload(dataURI);

//     res.json({ url: result.secure_url });
//   } catch (err) {
//     console.error("Upload Error:", err);
//     res.status(500).json({ error: "Upload failed: " + err.message });
//   }
// });
router.post("/upload", 
  upload.single("file"),
  processImage,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No valid image uploaded" });
      }

      // Prepare for Cloudinary upload
      const dataURI = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "processed-images",
        quality_analysis: true
      });

      res.json({ 
        url: result.secure_url,
        dimensions: result.width + "x" + result.height
      });
    } catch (err) {
      console.error("Upload Error:", err);
      res.status(500).json({ 
        error: err.message.startsWith('Only image') 
          ? err.message 
          : "Image processing failed"
      });
    }
  }
);


module.exports = router;
