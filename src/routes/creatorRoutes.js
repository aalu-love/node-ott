const express = require("express");
const router = express.Router();
const {
  uploadVideo,
  uploadContent,
  likeContent,
  getContentDetails,
  commentContent,
  creatorCollaborator,
  rateProposal,
  updateRate,
} = require("../controller/creatorController");
const {
  getLikesCount,
  getCommentArray,
} = require("../controller/commonController");
const { upload } = require("../common/storageInstance");
const {
  UPLOAD_CONTENT_VALIDATOR,
  COMMENT_VALIDATOR,
  isRequestValidated,
  CONTENT_COLLABRATOR_VALIDATOR,
} = require("../config/validator");
const {
  requiredSignin,
  adminMiddleware,
  userMiddleware,
} = require("../common/middleware");

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

// Define your API endpoints here
router.get("/content/:content_id", requiredSignin, getContentDetails);
router.post(
  "/upload-content",
  requiredSignin,
  userMiddleware,
  UPLOAD_CONTENT_VALIDATOR,
  isRequestValidated,
  uploadContent
);
router.post(
  "/upload-video/:content_id",
  requiredSignin,
  userMiddleware,
  upload.single("video_file"),
  uploadVideo
);
router.post("/like/:content_id", requiredSignin, userMiddleware, likeContent);
router.post(
  "/comment/:content_id",
  requiredSignin,
  userMiddleware,
  COMMENT_VALIDATOR,
  isRequestValidated,
  commentContent
);
router.post(
  "/content-collabration/:content_id",
  requiredSignin,
  userMiddleware,
  CONTENT_COLLABRATOR_VALIDATOR,
  isRequestValidated,
  creatorCollaborator
);
router.get(
  "/likes-count/:content_id",
  requiredSignin,
  userMiddleware,
  getLikesCount
);
router.get(
  "/content-comments/:content_id",
  requiredSignin,
  userMiddleware,
  getCommentArray
);
router.post("/rate-proposal", requiredSignin, userMiddleware, rateProposal);
router.post(
  "/rate-proposal-approval",
  requiredSignin,
  adminMiddleware,
  updateRate
);

module.exports = router;
