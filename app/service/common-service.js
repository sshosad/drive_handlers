const fs = require('fs')
const path = require('path')


async function writeFile(filePath, fileData) {
    await fs.writeFile(filePath, fileData, (err) => {
        throw err
    })
}

