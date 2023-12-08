const express = require("express");
const router = express.Router();
const { addPlan, buyPlan } = require("../controller/subscriptionController");
const { PLAN_VALIDATOR, isRequestValidated } = require("../config/validator");
const {
  requiredSignin,
  adminMiddleware,
  userMiddleware,
} = require("../common/middleware");

router.post(
  "/add-plan",
  requiredSignin,
  adminMiddleware,
  PLAN_VALIDATOR,
  isRequestValidated,
  addPlan
);
router.post("/buy-plan/:plan_id", requiredSignin, userMiddleware, buyPlan);

module.exports = router;
