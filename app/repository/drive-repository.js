const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

const config = require('../common/configurations')
const { getMimeTypeByExtension } = require('../common/utilities')

const AUTH_SCOPE = ['https://www.googleapis.com/auth/drive']
const API_CREDS = require('../auth/drive-api-keys.json')

// Function to authorize the google api keys
async function authorizeApiiCreds() {
    //creating instance of google auth
    const jwtAuth = new google.auth.JWT(
        API_CREDS.client_email,
        null,
        API_CREDS.private_key,
        AUTH_SCOPE
    )

    // authorizing created jwt client
    await jwtAuth.authorize()

    return jwtAuth
}

// // Function to download file from drive
async function downloadFileFromDrive(fileId, jwtAuth, destinationPath) {
    // getting drive
    const drive = google.drive({  version: 'v3', auth: jwtAuth })
    
    let writeStream = fs.createWriteStream(destinationPath)
    
    // getting file as a stream
    let fileData = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })
    
    fileData.data.on('end', () => { }).pipe(writeStream)

    fileData.data.on('error', () => { throw { mesage: 'Failed to download the file' } })
}

// function to upload file to drive
async function uploadFileToDrive(jwtAuth, filePath, folderId) {
    // getting drive
    const drive = google.drive({  version: 'v3', auth: jwtAuth })

    // getting file extension and mimetype
    let extension = path.extname(filePath)
    let mimeType = getMimeTypeByExtension(extension)

    // upload starts here
    await drive.files.create({
        media: {
            mimeType,
            body: fs.createReadStream(filePath)
        },

        requestBody: {
            name: 'test_upload_' + Math.floor(Math.random() * 1000000000) + extension,
            // parents is optional, if we provide FOLDER_ID it will insert file into specified folder, else to users drive
            parents: [folderId]
        }

    })
}

// MASTER-FUNCTION
async function downloadAndUploadVideoFileToDrive(fileId, folderId) {
    // Path to store downloaded file
    const filePath = config.storage_path + Math.floor(Math.random() * 1000000000) + '.pdf'

    // creating authorizing jwt
    const jwtAuth = await authorizeApiiCreds()

    // Downloading file from drive
    // await downloadFile(fileId, jwtAuth, filePath)
    await downloadFileFromDrive(fileId, jwtAuth, filePath)

    // uploading file to drive
    await uploadFileToDrive(jwtAuth, filePath, folderId)
}

module.exports = {
    downloadAndUploadVideoFileToDrive
}
