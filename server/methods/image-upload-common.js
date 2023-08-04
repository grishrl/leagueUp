/**
 * Image Upload Common - common image prepping info, returns a file name for the image and the buffer for saving to s3
 * 
 * reviewed:10-5-2020
 * reviewer:wraith
 * 
 */

const _ = require('lodash');

/**
 * @name prepImage
 * @function
 * @description accepts data uri and a naming object and returns buffer and parsed file name naming object should be an object where the value of the key value pairs is what you expect in the filename concatted with underscores
 * @param {string} dataURI 
 * @param {Object} namingObject 
 */
async function prepImage(dataURI, namingObject) {
    let uploadedFileName = '';
    var decoded = Buffer.byteLength(dataURI, 'base64');
    if (decoded.length > 2500000) {
        logObj.logLevel = 'ERROR';
        logObj.error = 'File was too big';
        throw new Error("File is too big!");
    } else {

        var png = dataURI.indexOf('png');
        var jpg = dataURI.indexOf('jpg');
        var jpeg = dataURI.indexOf('jpeg');
        var gif = dataURI.indexOf('gif');

        //create stamp
        var stamp = Date.now()
        stamp = stamp.toString();
        stamp = stamp.slice(stamp.length - 4, stamp.length);

        //parse filename
        Object.keys(namingObject).forEach(key => {
            let v = namingObject[key];
            if (!_.isString(v)) {
                try {
                    v = v.toString();
                } catch (e) {
                    console.log('Value does not have toString');
                }
            }
            if (_.isString(v)) {
                uploadedFileName += `${v.replace(/\s/g,'_')}_`;
            } else if (_.isArray(v) || _.isObject(v)) {
                uploadedFileName += `${(JSON.stringify(v)).replace(/\s/g,'_')}_`;
            } else {
                uploadedFileName += `${v}_`;
            }

        })

        //add stamp
        uploadedFileName += `${stamp}`;

        //add file extension
        if (png > -1) {
            uploadedFileName += ".png";
        } else if (jpg > -1) {
            uploadedFileName += ".jpg";
        } else if (jpeg > -1) {
            uploadedFileName += ".jpeg";
        } else if (gif > -1) {
            uploadedFileName += ".gif";
        } else {
            uploadedFileName += ".png";
        }

        //create buffer
        var buf = new Buffer.from(dataURI.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        return {
            buffer: buf,
            fileName: encodeURIComponent(uploadedFileName)
        }
    }
}

module.exports = { prepImage };