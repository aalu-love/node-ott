const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { connection } = require("../config/db");

// Environment variables
require("dotenv").config();

// Function to get user by email
const getUserByEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    await connection.query(query, [email], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Function to get user by username
const getUserByUsername = (username) => {
  return new Promise(async (resolve, reject) => {
    const query = "SELECT * FROM users WHERE username = ?";
    await connection.query(query, [username], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const SignUp = async (req, res) => {
  try {
    // Get the user data from the request body
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      usertype,
      admin_secret,
    } = req.body;

    const isAdminRegistration = admin_secret === "nodeott";

    // Check if the user already exists
    const existingUserByEmail = await getUserByEmail(email);

    if (existingUserByEmail.length > 0) {
      return res.status(409).json({
        message: `${
          isAdminRegistration ? "Admin" : "User"
        } already exists with same email.`,
      });
    }

    const existingUserByUsername = await getUserByUsername(username);

    if (existingUserByUsername.length > 0) {
      return res.status(409).json({
        message: `${
          isAdminRegistration ? "Admin" : "User"
        } already exists with same username.`,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the MySQL database
    let insertUserQuery =
      "INSERT INTO users (firstName, lastName, email, password, username) VALUES (?, ?, ?, ?, ?)";
    let values = [firstName, lastName, email, hashedPassword, username];
    if (usertype === "creator") {
      insertUserQuery =
        "INSERT INTO users (firstName, lastName, email, password, username, role) VALUES (?,?,?,?,?,?)";
      values = [...values, usertype];
    }
    if (isAdminRegistration) {
      insertUserQuery =
        "INSERT INTO users (firstName, lastName, email, password, username, role) VALUES (?,?,?,?,?,?)";
      values = [...values, "admin"];
    }

    await connection.query(insertUserQuery, values, async (err, result) => {
      if (err) {
        console.error("Error in SignUp:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      const user_id = result.insertId;
      await connection.query(
        "INSERT INTO user_profiles (user_id) VALUES (?)",
        [user_id],
        (err) => {
          if (err) {
            console.error("Error in SignUp:", err);
            return res.status(500).json({ message: "Internal server error." });
          }
        }
      );
      return res.status(201).json({
        message: `${
          isAdminRegistration ? "Admin" : "User"
        } created successfully.`,
      });
    });
  } catch (error) {
    console.error("Error in SignUp:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get the user from the MySQL database by email
    await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.error("Error in SignIn:", err);
          return res.status(500).json({ message: "Internal server error." });
        } else if (result.length === 0) {
          return res.status(404).json({ message: "User is not registered." });
        } else {
          const user = result[0];
          // Compare the provided password with the hashed password
          const isAuthenticated = await bcrypt.compare(password, user.password);

          if (!isAuthenticated) {
            return res.status(401).json({ message: "Invalid password." });
          }

          const token = jwt.sign(
            {
              _id: user.id,
              role: user.role,
              email: user.email,
              username: user.username,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );

          const userDataResponse = {
            _id: user.id,
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            username: user.username,
            role: user.role,
          };

          return res.status(200).json({ token, data: userDataResponse });
        }
      }
    );
  } catch (error) {
    console.error("Error in SignIn:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const Profile = async (req, res) => {
  try {
    const { email, username } = req.user;
    const { role } = req.body;

    // Check if the user already exists
    const existingUser = await getUserByEmail(email, username);

    if (existingUser.length > 0) {
      await connection.query(
        `UPDATE users SET role = ? WHERE email = ? AND username = ?`,
        [role, email, username],
        (err) => {
          if (err) {
            console.error("Error in Profile:", err);
            return res.status(500).json({ message: "Internal server error." });
          }
          return res
            .status(200)
            .json({ message: "User updated successfully." });
        }
      );
    }
  } catch (error) {
    console.error("Error in Profile:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const updateApprovalStatus = async (req, res, newStatus) => {
  try {
    const { createId } = req.params;

    // Check if the creator already has an approval
    await connection.query(
      "SELECT * FROM admin_approvals WHERE creator_id = ?",
      [createId],
      async (err, existingApproval) => {
        if (err) {
          console.error("Error in updateApprovalStatus:", err);
          return res.status(500).json({ message: "Internal server error." });
        } else if (existingApproval.length === 0) {
          // Create a new approval
          await connection.query(
            "INSERT INTO admin_approvals (creator_id, approval_status) VALUES (?,?)",
            [createId, newStatus],
            (err) => {
              if (err) {
                console.error("Error in updateApprovalStatus:", err);
                return res
                  .status(500)
                  .json({ message: "Internal server error." });
              } else {
                return res
                  .status(200)
                  .json({ message: "Creator approved successfully." });
              }
            }
          );
        } else {
          const creatorApproval = existingApproval[0];

          if (creatorApproval.approval_status === newStatus) {
            const action = newStatus ? "approved" : "disapproved";
            return res
              .status(400)
              .json({ message: `Creator already ${action}.` });
          }

          // Update approval status
          await connection.query(
            "UPDATE admin_approvals SET approval_status = ? WHERE creator_id = ?",
            [newStatus, createId]
          );

          const action = newStatus ? "approved" : "disapproved";
          return res
            .status(200)
            .json({ message: `Creator ${action} successfully.` });
        }
      }
    );
  } catch (error) {
    console.error(`Error in updateApprovalStatus: ${newStatus}`, error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const approveCreator = async (req, res) => {
  return await updateApprovalStatus(req, res, true);
};

const disapproveCreator = async (req, res) => {
  return await updateApprovalStatus(req, res, false);
};

module.exports = {
  SignUp,
  SignIn,
  Profile,
  approveCreator,
  disapproveCreator,
};
