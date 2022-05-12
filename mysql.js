const mysql = require("mysql");

var pool = mysql.createPool({
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PWRD,
    database: process.env.MYSQL_DB,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    debug: false,
    multipleStatements: true,
    connectionLimit: 4,
});

exports.pool = pool;
