const express = require('express');
const { connectDB } = require('./config/db');
const app = express();

async function main() {
	// Environment variables
	require('dotenv').config();

	// Mibbleware configuration

	// Connect to Database
	await connectDB();
}

main();

app.get('/', (req, res, next) => {
	res.status(200).send('Hello World');
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
