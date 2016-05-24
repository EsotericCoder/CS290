var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'oniddb.cws.oregonstate.edu',
  user  : 'kimw-db',
  password: 'ASYYNFyGnflNRcQj',
  database: 'kimw-db'
});

module.exports.pool = pool;