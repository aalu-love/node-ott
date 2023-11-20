const jwt = require('jsonwebtoken');
require('dotenv').config();

const requiredSignin = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const user = await jwt.verify(token, process.env.JWT_SECRET);
		req.user = user;
		next();
	} catch (error) {
		return res.status(500).json({ message: 'Invalid Bearer token or Sign in is required' });
	}
};

const userMiddleware = async (req, res, next) => {
	try {
		if (req.user.role !== 'user') {
			return res.status(401).json({ message: 'You are not authorized to access this resource' });
		}
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Something went wrong' });
	}
};

const adminMiddleware = async (req, res, next) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(401).json({ message: 'You are not authorized to access this resource' });
		}
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Something went wrong' });
	}
};

module.exports = {
	requiredSignin,
	userMiddleware,
	adminMiddleware,
};
