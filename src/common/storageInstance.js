const multer = require("multer");
const randomstring = require("randomstring");

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory to save files
  },
  filename: (req, file, cb) => {
    // Truncate the filename to a maximum length (e.g., 50 characters)
    const { mimetype } = file;
    const extension = `.${mimetype.split("/")[1]}`;
    const newname = randomstring.generate(15) + extension;
    req.file = {
      newname: newname,
    };
    cb(null, newname); // Generate unique filenames
  },
});

const upload = multer({ storage: storage });

module.exports = {
  upload,
};
