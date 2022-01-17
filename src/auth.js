const jwt = require('jsonwebtoken')
const conn = require('./conn')
const resp = require('./resp')

module.exports = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"]
    if (!token) return res.status(401).json(resp(false, "Access denied. No token provided."))
    token = token.split(' ')
    if (token.length > 1)
        token = token[1]
    else
        token = token[0]
    try {
        const decoded = jwt.verify(token, process.env.JWT)
        conn.select().from('users').where({
            id: decoded.id
        }).then(user => {
            if (user.length == 0) return res.status(404).json(resp(false, "User not found"))
            req.user = user[0]
            next()
        })
    } catch (ex) {
        res.status(400).json(resp(false, "Invalid token."))
    }
}