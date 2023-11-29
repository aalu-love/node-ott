const express = require("express");
const router = express.Router();
const {
  uploadVideo,
  uploadContent,
  likeContent,
} = require("../controller/creatorController");
const { upload } = require("../common/storageInstance");
// const { SIGNUP_VALIDATOR, LOGIN_VALIDATOR, isRequestValidated } = require('../config/validator');
const { requiredSignin } = require("../common/middleware");

// Define your API endpoints here
// router.post("/upload", upload.single("video_file"), (req, res) => {
//   // Access the uploaded file using req.file
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   const videoPath = req.file.path;

//   // You can now save videoPath to the database or perform further actions
//   return res
//     .status(200)
//     .json({ message: "File uploaded successfully.", videoPath });
// });

router.post("/upload-content", requiredSignin, uploadContent);
router.post(
  "/upload-video/:content_id",
  requiredSignin,
  upload.single("video_file"),
  uploadVideo
);
router.post("/like/:content_id", requiredSignin, likeContent);

module.exports = router;
