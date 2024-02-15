const dotEnv = require('dotenv')

dotEnv.config()

const env = process.env

function configurations() {
    return {
        port: env.PORT_NUMBER,
        storage_path: env.STORAGE_PATH

    }
}

module.exports = configurations()

