const { createConnection } = require('mysql');
const { userTable, userProfileTable } = require('../commom/sqlTable');

const connection = createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'ott_db',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// Define User Table
const requiredTables = [userTable, userProfileTable];

const createTable = () => {
	try {
		for (let table of requiredTables) {
			const tableName = table.split('NOT EXISTS')[1].split(' ')[1];
			connection.query(table, (err, res) => {
				if (err) {
					console.log('Error creating table: ', err);
				} else {
					console.log(`${tableName} table created successfully`);
				}
			});
		}
	} catch (err) {
		console.log('Error creating table: ', err);
	}
};

const connectDB = () => {
	try {
		connection.connect(err => {
			if (err) {
				console.log('Error connecting to MySQL: ', err);
			} else {
				console.log('Connected to MySQL');
				createTable();
			}
		});
	} catch (err) {
		console.log('Error connecting to MySQL: ', err);
	}
};

module.exports = {
	connectDB,
	connection,
};
