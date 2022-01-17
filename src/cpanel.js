const cpanelAPI = require('cpanel-node')

module.exports = new cpanelAPI({
    host: process.env.CPANEL_HOST,
    user: process.env.CPANEL_USER,
    pass: process.env.CPANEL_PWD,
    https: true,
    port: process.env.CPANEL_PORT.toString()
})