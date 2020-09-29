  const _ = require('lodash');

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

          console.log(JSON.stringify(namingObject))
              //parse filename
          Object.keys(namingObject).forEach(key => {
              let v = namingObject[key];
              if (!_.isString(v)) {
                  try {
                      v = v.toString();
                  } catch (e) {
                      console.log('Value does not have to string');
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
              fileName: uploadedFileName
          }
      }
  }

  module.exports = { prepImage };