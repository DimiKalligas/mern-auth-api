const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config() // process.env now has the keys and values we defined in your .env file

const app = express()

// db connect
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(() => console.log('DB connected'))
    .catch(() => console.log('DB connection error'))

// import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
// app.use(function (err, req, res, next) {
//     if (err.name === 'UnauthorizedError') {
//         res.status(401).json({ error: 'Unauthorized!' });
//     }
// });

// Morgan displays on console request type, status code and response timne
app.use(morgan('dev'))
// instead of body-parser: to be able to read data from Postman
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// to be able to use with React
// app.use(cors())
if (process.env.NODE_ENV = 'development') { // if in dev mode, allow also React
    app.use(cors({ origin: `http://localhost:3000` }))
}

// Routing
app.use('/api', authRoutes)
app.use('/api', userRoutes)

const port = process.env.PORT || 8000
app.listen(port, () => { console.log(`API is running on port ${port} - ${process.env.NODE_ENV}`) })