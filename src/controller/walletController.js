const { connection } = require("../config/db");

const addTransactionHistory = async (user_id, amount, transaction_type) => {
  try {
    const query =
      "INSERT INTO wallet_transactions (user_id, amount, transaction_type) VALUES (?,?,?)";
    const values = [user_id, amount, transaction_type];
    await connection.query(query, values, async (err) => {
      if (err) {
        console.error("Error in addTransactionHistory:", err);
        return;
      }
    });
  } catch (error) {
    console.error("Error in addTransactionHistory:", error);
    return;
  }
};

const createWallet = async (req, res) => {
  try {
    const { _id: user_id } = req.user;
    const query = "INSERT INTO user_wallets (user_id) VALUES (?)";
    const values = [user_id];
    await connection.query(query, values, async (err, result) => {
      if (err?.code == "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Wallet already exists." });
      }
      if (err) {
        console.error("Error in createWallet:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result) {
        await addTransactionHistory(user_id, 0, "credit");
        return res.status(201).json({
          message: "Wallet created successfully.",
          wallet: result[0],
        });
      }
    });
  } catch (error) {
    console.error("Error in createWallet:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const topupWallet = async (req, res) => {
  try {
    const { _id: user_id } = req.user;
    const { amount } = req.body;
    const Updatequery =
      "UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?";
    const Updatevalues = [amount, user_id];
    await connection.query(Updatequery, Updatevalues, async (err, result) => {
      if (err) {
        console.error("Error in topupWallet:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result) {
        console.log(result);
        if (result?.affectedRows == 0) {
          return res.status(404).json({ message: "Wallet not found." });
        } else {
          await addTransactionHistory(user_id, amount, "credit");
          return res.status(201).json({
            message: "Wallet topup successfully.",
            balance: result[0],
          });
        }
      }
    });
  } catch (error) {
    console.error("Error in topupWallet:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const updateWallet = async (res, user_id, amount, transaction_type) => {
  try {
    const query =
      "UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?";
    const values = [amount, user_id];
    await connection.query(query, values, async (err, result) => {
      if (err) {
        console.error("Error in updateWallet:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result) {
        if (result?.affectedRows == 0) {
          return res.status(404).json({ message: "Wallet not found." });
        } else {
          await addTransactionHistory(user_id, amount, transaction_type);
          return res.status(201).json({
            message: "Wallet updated successfully.",
            balance: result[0],
          });
        }
      }
    });
  } catch (error) {
    console.error("Error in updateWallet:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const creditAmountToWallet = async (req, res) => {
  const { _id: user_id } = req.user;
  const { amount } = req.body;
  return await updateWallet(res, user_id, amount, "credit");
};

const debitAmountToWallet = async (req, res) => {
  const { _id: user_id } = req.user;
  const { amount } = req.body;
  return await updateWallet(
    res,
    user_id,
    amount <= 0 ? amount : amount * -1,
    "debit"
  );
};

module.exports = {
  createWallet,
  topupWallet,
  creditAmountToWallet,
  debitAmountToWallet,
};
