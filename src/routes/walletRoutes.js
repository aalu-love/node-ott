const express = require("express");
const router = express.Router();
const {
  createWallet,
  topupWallet,
  creditAmountToWallet,
  debitAmountToWallet,
} = require("../controller/walletController");
const { TOPUP_VALIDATOR, isRequestValidated } = require("../config/validator");
const { requiredSignin } = require("../common/middleware");

// Define your API endpoints here
router.post("/create-wallet", requiredSignin, createWallet);
router.post(
  "/topup-wallet",
  requiredSignin,
  TOPUP_VALIDATOR,
  isRequestValidated,
  topupWallet
);
router.post(
  "/credit-amount-to-wallet",
  requiredSignin,
  TOPUP_VALIDATOR,
  isRequestValidated,
  creditAmountToWallet
);
router.post(
  "/debit-amount-to-wallet",
  requiredSignin,
  TOPUP_VALIDATOR,
  isRequestValidated,
  debitAmountToWallet
);

module.exports = router;
