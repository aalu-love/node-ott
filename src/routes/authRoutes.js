const express = require("express");
const router = express.Router();
const {
  SignIn,
  SignUp,
  Profile,
  approveCreator,
  disapproveCreator,
} = require("../controller/authController");
const {
  SIGNUP_VALIDATOR,
  LOGIN_VALIDATOR,
  isRequestValidated,
} = require("../config/validator");
const {
  requiredSignin,
  adminMiddleware,
} = require("../common/middleware");

// Define your API endpoints here
router.post("/signup", SIGNUP_VALIDATOR, isRequestValidated, SignUp);
router.post("/signin", LOGIN_VALIDATOR, isRequestValidated, SignIn);
router.post("/profile", requiredSignin, Profile);
router.get(
  "/approve-creator/:createId",
  requiredSignin,
  adminMiddleware,
  approveCreator
);
router.get(
  "/disapprove-creator/:createId",
  requiredSignin,
  adminMiddleware,
  disapproveCreator
);

module.exports = router;
