const { check, validationResult } = require("express-validator");

const SIGNUP_VALIDATOR = [
  check("firstName").notEmpty().withMessage("firstName is required"),
  check("lastName").notEmpty().withMessage("lastName is required"),
  check("email").notEmpty().withMessage("email is required"),
  check("password").notEmpty().withMessage("password is required"),
  check("usertype")
    .if(check("admin_secret").isEmpty())
    .notEmpty()
    .withMessage("usertype is required")
    .isIn(["creator", "viewer"])
    .withMessage("usertype must be either 'user' or 'admin'"),
  check("admin_secret")
    .if(check("usertype").isEmpty()) // Make admin_secret required only if usertype is not empty
    .notEmpty()
    .withMessage("admin_secret is required"),
];

const LOGIN_VALIDATOR = [
  check("email").notEmpty().isEmail().withMessage("email is required"),
  check("password").notEmpty().withMessage("password is required"),
];

const UPLOAD_CONTENT_VALIDATOR = [
  check("title").notEmpty().withMessage("title is required"),
  check("description").notEmpty().withMessage("description is required"),
];

const COMMENT_VALIDATOR = [
  check("comment").notEmpty().withMessage("comment is required"),
  check("parent_id")
    .notEmpty()
    .isNumeric()
    .withMessage("parent_id is required"),
];

const CONTENT_COLLABRATOR_VALIDATOR = [
  check("collaborator_id")
    .notEmpty()
    .isNumeric()
    .withMessage("collaborator_id is required"),
];

const PLAN_VALIDATOR = [
  check("name").notEmpty().withMessage("name is required"),
  check("price").notEmpty().isNumeric().withMessage("price is required"),
  check("duration_months")
    .notEmpty()
    .isNumeric()
    .withMessage("duration_months is required"),
];

const TOPUP_VALIDATOR = [
  check("amount").notEmpty().isNumeric().withMessage("amount is required"),
];

const isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.array().length > 0) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

module.exports = {
  SIGNUP_VALIDATOR,
  LOGIN_VALIDATOR,
  UPLOAD_CONTENT_VALIDATOR,
  COMMENT_VALIDATOR,
  CONTENT_COLLABRATOR_VALIDATOR,
  PLAN_VALIDATOR,
  TOPUP_VALIDATOR,
  isRequestValidated,
};
