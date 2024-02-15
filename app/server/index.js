const express = require('express')
const bodyParser = require('body-parser')

const app = express()

const routes = require('../routes/index')
const config = require('../common/configurations')

const PORT = config.port

const start = () => {
    app.use(bodyParser.json())
    app.use('/api', routes)

    app.use('*', (req, res) => {
        res.status(404)
        res.send({message:'Route not found'})
    })

    app.listen(PORT, () => {
        console.log('App is running on port ' + PORT)
    })
}

module.exports = {
    start
}
