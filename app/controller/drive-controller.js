const driveRepository = require('../repository/drive-repository')

async function downloadAndUploadVideoFileToDrive(req, res) {
    try {
        // Destructuring request body
        let { file_id, url, folder_id } = req.body

        // Validating required parameters
        if(!file_id && !url) {
            throw { status: 'failed', message: 'required parameter not found' }
        }

        // If file_id is not there, get it from url
        if(!file_id) {
            let splittedUrl = url.split('/')
            // file_id will be present after ..../d/FILE_ID/....
            let d_index = splittedUrl.indexOf('d')
            file_id = splittedUrl[d_index + 1]

            // incase in url also file_id doesn't exists
            if(!file_id) {
                throw { status: 'failed', message: 'The url found in the request is invalid' }
            }
        }

        //calling repo funtion for requires ops
        await driveRepository.downloadAndUploadVideoFileToDrive(file_id, folder_id)

        res.send({ status: 'success', message: 'Operation performed successfully' })

    } catch(err) {
        console.log(err);
        // If any erorr found
        let response = {
            status: 'failed',
            message: err.message || 'Something went wrong!'
        }

        if(err.code) response.code = err.code

        res.send(response)
    }
}

module.exports = {
    downloadAndUploadVideoFileToDrive
}
