const joi = require('joi')

module.exports.new_email = (data) => {
    return joi.object({
        email: joi.string().email().required(),
        subject: joi.string().min(1).required(),
        message: joi.string().min(1).required()
    }).validate(data)
}