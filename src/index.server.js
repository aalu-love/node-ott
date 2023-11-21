const express = require('express');
const { connectDB } = require('./config/db');
const app = express();

const authRoutes = require('./routes/authRoutes');

async function main() {
	// Environment variables
	require('dotenv').config();

	// Mibbleware configuration
	app.use(express.json());

	// Connect to Database
	await connectDB();
}

main();

app.get('/', (req, res, next) => {
	res.status(200).json({
		message: 'Hello World',
	});
});

//Routes
app.use('/auth/v1', [authRoutes]);

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
