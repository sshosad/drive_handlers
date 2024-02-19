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
    
    await new Promise((resolve, reject) => {
        fileData.data.on('end', () => { }).pipe(writeStream).on('finish', () => { resolve(true) })
        fileData.data.on('error', () => { reject({ mesage: 'Failed to download the file' }) })
    })
    // fileData.data.on('end', () => { }).pipe(writeStream)

    
}

// function to upload file to drive
async function uploadFileToDrive(jwtAuth, filePath, folderId) {
    // getting drive
    const drive = google.drive({  version: 'v3', auth: jwtAuth })
    let fileSize = fs.statSync(filePath).size
    
    // getting file extension and mimetype
    let extension = path.extname(filePath)
    let mimeType = getMimeTypeByExtension(extension)

    //chunk size to upload at once
    const chunch_size_at_once = 1024   
   
    // upload starts here
    let output = await drive.files.create({
        uploadType:'resumable',
        media: {
            mimeType,
            body: fs.createReadStream(filePath, { start: 0, end: chunch_size_at_once })
        },
        requestBody: {
            name: 'test_upload_' + Math.floor(Math.random() * 1000000000) + extension,
            // parents is optional, if we provide FOLDER_ID it will insert file into specified folder, else to users drive
            parents: [folderId],
            mimeType
        }

    })
    
    // newly created fil id
    let fileId = output.data.id 

    // looping and uploading chunks
    for(let i = 0; i <= fileSize; i++ ) {
        let end = ((i + chunch_size_at_once) < fileSize) ? (i + chunch_size_at_once) : fileSize
        
        // As first chunk uploaded while creating file, we will starts with secobd chunk
        if(i === 0) {
            i = chunch_size_at_once + 1
            end = chunch_size_at_once * 2
        }

        // Updating chunks to existing file
        await drive.files.update( {
            fileId, 
            uploadType:'resumable',
            media: {
                mimeType,
                body: fs.createReadStream(filePath, { start: i, end })
            }
        })
        console.log('File Upload in progress #',((end/fileSize)*100).toFixed(2) + '%' );
        i = end 
    }
}

// MASTER-FUNCTION
async function downloadAndUploadVideoFileToDrive(fileId, folderId) {
    // Path to store downloaded file
    const filePath = config.storage_path + Math.floor(Math.random() * 1000000000) + '.mp4'

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
