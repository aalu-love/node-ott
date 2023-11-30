const express = require("express");
const router = express.Router();
const {
  SignIn,
  SignUp,
  Profile,
  approveCreator,
  disapproveCreator,
} = require("../controller/authController");
// const { SIGNUP_VALIDATOR, LOGIN_VALIDATOR, isRequestValidated } = require('../config/validator');
const { requiredSignin } = require("../common/middleware");

// Define your API endpoints here
router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.post("/profile", requiredSignin, Profile);
router.get("/approve-creator/:createId", approveCreator);
router.get("/disapprove-creator/:createId", disapproveCreator);

module.exports = router;
