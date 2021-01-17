const mysql = require('mysql');
const config = require('./config.json')['development']

if (process.env.JAWSDB_URL){
    var connection = mysql.createConnection(process.env.JAWSDB_URL)
} else {
    var connection = mysql.createConnection({
        host:     config.host,
        user:     config.user,
        password: config.password,
        database: config.database
    })
}


connection.connect();
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('mysql connection: ', 2 === results[0].solution);
  });

  module.exports = connection;