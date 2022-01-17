const crypto = require('crypto')

module.exports.encrypt = ((text, key, iv) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(text, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    return encrypted
})

module.exports.decrypt = ((encrypted, key, iv) => {
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encrypted, 'base64', 'utf8')
    return (decrypted + decipher.final('utf8'))
})

module.exports.iv = crypto.randomBytes(8).toString('hex')
module.exports.key = (key, id) => {
    return key.slice(0, -id.length) + id
}