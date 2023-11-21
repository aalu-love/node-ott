const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { connection } = require('../config/db');

// Environment variables
require('dotenv').config();

// Function to get user by email
const getUserByEmail = (email, username) => {
	return new Promise((resolve, reject) => {
		const query = 'SELECT * FROM users WHERE email = ? OR username = ?';
		connection.query(query, [email, username], (err, result) => {
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
		const { email, password, username, firstName, lastName } = req.body;

		// Check if the user already exists
		const existingUser = await getUserByEmail(email, username);

		if (existingUser.length > 0) {
			return res.status(409).json({ message: 'User already exists.' });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user in the MySQL database
		const insertUserQuery = 'INSERT INTO users (firstName, lastName, email, password, username) VALUES (?, ?, ?, ?, ?)';
		const values = [firstName, lastName, email, hashedPassword, username];

		await connection.query(insertUserQuery, values, err => {
			if (err) {
				console.error('Error in SignUp:', err);
				return res.status(500).json({ message: 'Internal server error.' });
			}
			return res.status(201).json({ message: 'User created successfully.' });
		});
	} catch (error) {
		console.error('Error in SignUp:', error);
		return res.status(500).json({ message: 'Internal server error.' });
	}
};

const SignIn = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Get the user from the MySQL database by email
		await connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
			if (err) {
				console.error('Error in SignIn:', err);
				return res.status(500).json({ message: 'Internal server error.' });
			} else if (result.length === 0) {
				return res.status(404).json({ message: 'User is not registered.' });
			} else {
				const user = result[0];
				// Compare the provided password with the hashed password
				const isAuthenticated = await bcrypt.compare(password, user.password);

				if (!isAuthenticated) {
					return res.status(401).json({ message: 'Invalid password.' });
				}

				const token = jwt.sign({ _id: user.id, role: user.role, email: user.email, username: user.username }, process.env.JWT_SECRET, {
					expiresIn: '1h',
				});

				const userDataResponse = {
					_id: user.id,
					firstName: user.firstname,
					lastName: user.lastname,
					email: user.email,
					username: user.username,
				};

				return res.status(200).json({ token, data: userDataResponse });
			}
		});
	} catch (error) {
		console.error('Error in SignIn:', error);
		return res.status(500).json({ message: 'Internal server error.' });
	}
};

const Profile = async (req, res) => {
	try {
		const { email, username } = req.user;
		const { role } = req.body;

		// Check if the user already exists
		const existingUser = await getUserByEmail(email, username);

		if (existingUser.length > 0) {
			await connection.query(`UPDATE users SET role = ? WHERE email = ? AND username = ?`, [role, email, username], err => {
				if (err) {
					console.error('Error in Profile:', err);
					return res.status(500).json({ message: 'Internal server error.' });
				}
				return res.status(200).json({ message: 'User updated successfully.' });
			});
		}
	} catch (error) {
		console.error('Error in Profile:', error);
		return res.status(500).json({ message: 'Internal server error.' });
	}
};

module.exports = {
	SignUp,
	SignIn,
	Profile,
};
