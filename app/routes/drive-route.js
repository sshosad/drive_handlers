const express = require('express')
const router = express.Router()

const driverController = require('../controller/drive-controller')

router.get('/download-upload', driverController.downloadAndUploadVideoFileToDrive)

module.exports = router