const { validationResult } = require('express-validator')

exports.runValidation = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { // if there are errors
        return res.status(422).json({ // 422 -> cannot process the request
            error: errors.array()[0].msg // grab the message of first error

        })
    }
    next() // because this is middleware
}