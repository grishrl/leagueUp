const jimp = require('jimp');

const fs = require('fs');

jimp.read('Anti-Clown Association6449_logo.png').then(
    img => {
        console.log(img);
        // img.write('test2.png');
    }
)

let data = fs.readFileSync('Anti-Clown Association6449_logo.png');

console.log(data);

// async function imageToPng(blob) {
//   if (blob.type === "image/png") {
//     return blob;
//   }

//   const image = new Image();
//   await new Promise((resolve, reject) => {
//     image.onload = resolve;
//     image.onload = reject;
//     image.src = URL.createObjectURL(blob);
//   });
//   const canvas = Object.assign(document.createElement("canvas"), {
//     width: image.naturalWidth,
//     height: image.naturalHeight,
//   });
//   canvas.getContext("2d").drawImage(image, 0, 0);
//   URL.revokeObjectURL(image.src);
//   return new Promise(resolve => canvas.toBlob(resolve));
// }