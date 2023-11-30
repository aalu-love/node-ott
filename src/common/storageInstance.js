const multer = require("multer");

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory to save files
  },
  filename: (req, file, cb) => {
    // Truncate the filename to a maximum length (e.g., 50 characters)
    const originalName = file.originalname;
    const maxLength = 50;
    const truncatedName =
      originalName.length > maxLength
        ? originalName.substring(0, maxLength)
        : originalName;
    cb(null, truncatedName); // Generate unique filenames
  },
});

const upload = multer({ storage: storage });

module.exports = {
  upload,
};
