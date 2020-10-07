const User = require('../models/user')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const _ = require('lodash')
const { OAUTH2Client, OAuth2Client } = require('google-auth-library')
const nodemailer = require('nodemailer')
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Signup with no email confirmation
// exports.signup = (req, res) => {
//     console.log('Req body on signup ', req.body)
//     // res.json({
//     //     data: 'you hit signup'
//     // })
//     const { name, email, password } = req.body

//     User.findOne({ email: email }).exec((err, user) => {
//         if (user) {
//             return res.status(400).json({ error: 'Email is taken' })
//         }
//     })

//     let newUser = new User({ name, email, password })
//     newUser.save((err, success) => {
//         if (err) {
//             console.log('Signup error ', err)
//             return res.status(400).json({
//                 error: err
//             })
//         }
//         res.json({
//             message: 'Signup success - now go sign in!'
//         })
//     })
// }

exports.signup = (req, res) => {
    //     const { name, email, password } = req.body

    //     User.findOne({ email: email }).exec((err, user) => {
    //         if (user) {
    //             return res.status(400).json({ error: 'Email is taken' })
    //         }
    //     })

    //     const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' })

    //     const emailData = {
    //         from: process.env.EMAIL_FROM,
    //         to: email,
    //         subject: `Account activation link`,
    //         html: `
    //             <p>Please use the following link to activate your account</p>
    //             <p>${process.env.CLIENT_URL}/auth/activate</p>
    //             <hr />
    //             <p>This email may contain sensitive data</p>
    //             <p>${process.env.CLIENT_URL}</p>
    //         `
    //     }
    //     sgMail.send(emailData)
    //         .then(sent => {
    //             // console.log('Signup email sent')
    //             return res.json({
    //                 message: `Email has been sent to ${email}.`
    //             })
    //         })
    //         .catch(err => console.log(err))
    // }
    const { name, email, password } = req.body

    User.findOne({ email: email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({ error: 'Email is taken' })
        }
    })

    const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' })


    let transporter = nodemailer.createTransport({ // you need to create this variable. It contains the SMPT information from your email server. I'm using my gmail account so I put the gmail ones.
        host: 'smtp.gmail.com', // host, in my case the gmail host.
        port: 465, //  Gmail lets you use two ports, 587 and 465.
        secure: true, // Gmail require TSL/SSL security, that the reason I put true. If your email server does not require it, leave it as false.
        auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_FROM_PASSWORD
        } // your email account credentials.
    })

    // email data.
    const emailData = {
        from: `Application <${process.env.EMAIL_FROM}>`, // This is a bit different from the sendgrip one. You must put a name (the name will appear as the contact name) and (inside the '<>' <LIKE THIS>) the email from.
        to: email,
        subject: 'Email confirmation',
        html: `
        <h1>Confirm your email</h1>
        <p>Please confirm your email adrress by clicking on the link below</p>
        <a>${process.env.CLIENT_URL}/auth/activate/${token}</a>
        <hr/>
        <small>This email may contain sensitive information</p>
        <br/>
        <small>${process.env.CLIENT_URL}</small> `
    }

    // sending the email.
    transporter.sendMail(emailData)
        .then(sent => {
            return res.json({ message: 'signup mail has been sent' })
        })
        .catch(err => {
            console.log(`ERROR SENDING EMAIL: ${err}`)
            return;
        })
}

exports.accountActivation = (req, res) => {
    const { token } = req.body

    if (token) {
        // JWT_ACCOUNT_ACTIVATION is sequrity key
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                console.log('JWT verify in account activation error')
                return res.status(401).json({
                    error: 'expired link. signup again'
                })
            }
            const { name, email, password } = jwt.decode(token)
            const user = new User({ name, email, password })
            user.save((err, user) => {
                if (err) {
                    console.log('save user in account activation error', err)
                    return res.status(401).json({
                        error: 'Error saving user in database'
                    })
                }
                return res.json({
                    message: `Signup success for user ${name}`
                })
            })
        })
    } else {
        return res.json({
            message: 'something went really bad.'
        })
    }
}

exports.signin = (req, res) => {
    const { email, password } = req.body
    // check if user exists
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist'
            })
        }
        // authenticate
        if (!user.authenticate(password)) {// User Schema method
            return res.status(400).json({
                error: 'email and password do not match'
            })
        }
        // generate token and send to client
        const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
        const { _id, name, email, role } = user
        return res.json({
            token,
            user: { _id, name, email, role }
        })
    })
}

exports.accountActivation = (req, res) => {
    const { token } = req.body

    if (token) {
        // JWT_ACCOUNT_ACTIVATION is sequrity key
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                console.log('JWT verify in account activation error')
                return res.status(401).json({
                    error: 'expired link. signup again'
                })
            }
            const { name, email, password } = jwt.decode(token)
            const user = new User({ name, email, password })
            user.save((err, user) => {
                if (err) {
                    console.log('save user in account activation error', err)
                    return res.status(401).json({
                        error: 'Error saving user in database'
                    })
                }
                return res.json({
                    message: `Signup success for user ${name}`
                })
            })
        })
    } else {
        return res.json({
            message: 'something went really bad.'
        })
    }
}

// middleware to protect end-points
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET, // this adds user property to user object: req.user
    // so, if we apply this to any route, then we can access user (for db query and so on..)
    algorithms: ["HS256"]
})

// check if user is admin
exports.adminMiddleware = (req, res, next) => {
    User.findById({ _id: req.user._id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }
        if (user.role !== 'admin') {
            return res.status(400).json({
                error: 'Admin resourse. Access denied'
            })
        }
        // if user is indeed admin, then req.profile has the user info
        req.profile = user;
        next()
    })
}

exports.forgotPassword = (req, res) => {
    const { email } = req.body

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist'
            })
        }
        // user should check their email and reset their password within 10m
        const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' })

        let transporter = nodemailer.createTransport({ // you need create this variable. It contains the SMPT informations from your email server. I'm using my gmail account so I put the gmail ones.
            host: 'smtp.gmail.com', // host, in my case the gmail host.
            port: 465, // The port. Gmail has two ports, 587 and 465, I'm tried use the 587 one but I receive an error so I'm using the 465 one.
            secure: true, // Gmail require TSL/SSL security, that the reason I put true. If your email server does not require, leaves it as false.
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_FROM_PASSWORD // I've created this env variable at the .env file.
            } // your email account credentials.
        })

        // email data.
        const emailData = {
            from: `Application <${process.env.EMAIL_FROM}>`, // This is a bit different from the sendgrip one. You must put a name (the name will appear as the contact name) and (inside the '<>' <LIKE THIS>) the email from.
            to: email,
            subject: 'Password Reset link',
            html: `
                <p>Please use the following link to reset your password</p>
                <a>${process.env.CLIENT_URL}/auth/password/reset/${token}</a>
                <hr/>
                <small>This email may contain sensitive information</p>
                <br/>
                <small>${process.env.CLIENT_URL}</small> `
        }

        // βάζω το token στο resetPasswordLink και μετά στέλνω το email που θα μπορεί ο user να κάνει reset
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                console.log('RESET PASSWORD LINK ERROR', err)
                return res.status(400).json({
                    error: 'Database connection error on user password forgot request'
                })
            } else {
                // sending the email.
                transporter.sendMail(emailData)
                    .then(sent => {
                        return res.json({ message: 'reset password mail has been sent' })
                    })
                    .catch(err => {
                        console.log(`Database connection error on user password forgot request: ${err}`)
                        return;
                    })
            }
        })

    })
}
//     })
// }

exports.resetPassword = (req, res) => {
    // resetPasswordLink is a property of the User schema
    const { resetPasswordLink, newPassword } = req.body

    if (resetPasswordLink) { // resetPasswordLink is a JWT, so we check if it has expired
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
            if (err) {
                return res.status(400).json({
                    error: 'Expired link. Try again'
                })
            }
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: 'Something went wazoo. Try again later'
                    })
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }
                // user = { ...rest, ...updatedFields } 
                // setValues({...values, updatedFields})
                user = _.extend(user, updatedFields) // ^ πως γίνεται με spread?
                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Expired resetting user password'
                        })
                    }
                    res.json({
                        message: `Please use your new password to login`
                    })
                })
            })
        })
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
exports.googleLogin = (req, res) => {
    const { idToken } = req.body

    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
        .then(response => {
            const { email_verified, name, email } = response.payload
            if (email_verified) {
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
                        const { _id, email, name, role } = user
                        return res.json({
                            token, user: { _id, email, name, role }
                        })
                    } else { // User is not found in our db, so let's create one
                        let password = email + process.env.JWT_SECRET // also create a pwd
                        user = new User({ name, email, password })
                        user.save((err, data) => {
                            if (err) {
                                console.log('ERROR GOOGLE LOGIN ON USER SAVE', err)
                                return res.status(400).json({
                                    error: 'User signup failed with Google'
                                })
                            }
                            const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
                            const { _id, email, name, role } = data
                            return res.json({
                                token, user: { _id, email, name, role }
                            })
                        })
                    }
                })
            } else {// user was not verified
                return res.status(400).json({
                    error: 'User login failed. Try again'
                })
            }
        })
}