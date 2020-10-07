const express = require('express')
const router = express.Router()

// import controller
const { signup, accountActivation, signin, forgotPassword, resetPassword, googleLogin } = require('../controllers/auth')

// import validators
const {
    userSignupValidator,
    userSigninValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../validators/auth') // the array of error checks
const { runValidation } = require('../validators/index') // this is the actual middleware 

router.post('/signup', userSignupValidator, runValidation, signup)
router.post('/signin', userSigninValidator, runValidation, signin)
router.post('/account-activation', accountActivation)
// forgot reset password
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword)
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword)
// Google and Facebook
router.post('/google-login', googleLogin)

module.exports = router
