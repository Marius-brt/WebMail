const joi = require('joi')

module.exports.login = (data) => {
    return joi.object({
        username: joi.string().min(4).max(30).regex(/^[\w](?!.*?\.{2})[\w.]{2,28}[\w]$/).required(),
        password: joi.string().min(5).required()
    }).validate(data)
}

module.exports.new_user = (data) => {
    return joi.object({
        username: joi.string().min(4).max(30).regex(/^[\w](?!.*?\.{2})[\w.]{2,28}[\w]$/).required(),
        password: joi.string().min(5).required()
    }).validate(data)
}