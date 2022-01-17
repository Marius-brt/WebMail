module.exports = require('knex').knex({
    client: 'mysql',
    connection: {
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DB,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PWD,
        port: 3306
    }
})