// MULTER
// --------------------------------------- //
// npm i multer
// --------------------------------------- //
// IN MY MIDDLEWARE FILE: multerMiddleware.js
// --------------------------------------- //
// let multer = require('multer');
// let path = require('path');
// let productDestination = path.join(__dirname + '/..' + '/..' + '/public' + '/img' + '/products');
// let userAvatarDestination = path.join(__dirname + '/..' + '/..' + '/public' + '/img' + '/users');
// let storage = multer.diskStorage ({
//     destination: (req,file,cb) => {
//         let { fieldname } = file;        // file is the file, lol. I'm destructuring the file to get the <form input type file> name
//         if (fieldname === 'avatar') {    // depending on the fieldname, I use different paths to store them, it's quite versatile
//             cb(null, userAvatarDestination);
//         } else {
//             cb(null, productDestination);
//         };
//     },
//     filename: (req,file,cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     },
// });
// let upload = multer( { storage } );
// module.exports = upload;
// --------------------------------------- //
// IN ROUTE FILE: products.js {example w/ multiple files}
// --------------------------------------- //
// let upload = require('../middlewares/multerMiddleware');
// let multerFields = [
//     {
//         name: 'img',     // form input type file name
//         maxCount: 1      // amount of files permitted
//     },
//     {
//         name: 'card',
//         maxCount: 1
//     }
// ];
// router.post('/', upload.fields(multerFields), productsController.store);
// --------------------------------------- //
// IN ROUTE FILE: users.js {exampe w/ single file}
// --------------------------------------- //
// let upload = require('../middlewares/multerMiddleware');
// router.post('/', upload.single('avatar'), usersController.processRegister);
// --------------------------------------- //
// IN CONTROLLER FILE: products.js {example w/ multiple files}
// --------------------------------------- //
// let files = req.files;           // store what I get from the "body"
// let { img, card } = files;       // destructure array of objects
// let product = {
//     id: lastId(products) + 1,
//     img: img[0].filename,        // first file, or position of array, of first file object
//     card: card[0].filename,      // first file, or position of array, of second file object
//     name: toUpper(req.body.name),
//     category: req.body.category.map(toUpper),
//     relevant: storeBool(req.body.relevant),
//     inOffer: storeBool(req.body.inOffer),
//     price: parseInt(req.body.price),
//     discount: parseInt(req.body.discount),
//     description: req.body.description
// };
// --------------------------------------- //
// IN THE VIEW / HTML
// --------------------------------------- //
// <form action="register" method="POST" enctype="multipart/form-data">
// <input type="file" name="img/card/avatar">
// </form>
// --------------------------------------- //