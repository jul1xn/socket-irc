const mysql = require('mysql2');
const secrets = require('./secrets.json');
const pool = mysql.createPool(secrets.mysql_connection);

module.exports = pool;