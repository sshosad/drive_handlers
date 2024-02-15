const express = require('express')

const router = express.Router()

// import all route here
const driverRoute = require('./drive-route')

router.use('/drive', driverRoute)

module.exports = router