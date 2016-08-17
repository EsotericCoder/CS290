var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'host',
  user  : 'root',
  password: 'password',
  database: 'student' 
});

module.exports.pool = pool;