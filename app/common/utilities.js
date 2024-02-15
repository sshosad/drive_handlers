function getMimeTypeByExtension(ext) {
    switch(ext) {
        case '.json':
            return 'application/json'
        
        case '.pdf':
            return 'application/pdf'
        
        case '.mp4': 
            return 'video/mp4'
        
        // can add more extension type here 

        default:
            return ''
    }
}

module.exports = {
    getMimeTypeByExtension
}