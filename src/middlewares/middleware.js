// -------------------------------------------------------------------------- //
// LOG
// as an example, a logs middleware
// what user does => log
// let fs = require('fs');
// let logMiddleware = (req,res,next) => {
//  fs.appendFileSync(myPath + 'log.txt','User requested ' + req.url + '\r\n');
//  next();
// };
// '\r\n' to make line & jump
// to make it GLOBAL, in app.js
// require & 
// app.use(logMiddleWare);
// -------------------------------------------------------------------------- //
// TO MAKE A MIDDLEWARE THAT AFFECTS VIEWS, LIKE NAVBAR ETC
// (WITH SESSION)
// let middleware = (req,res,next) => {
// res.locals.var = false               // i send a variable to locals but set it 'false'
// if (req.session.var) {               // if i have x var in session
//  res.locals.var = true;              // i set my locals var to true
//  res.locals.var = req.session.var;   // i store my session var into the locals var
//  };
//  next();
// };
// EXPORT MIDDLEWARE
// APP => REQUIRE MIDDLEWARE
// APP.USE(MIDDLEWARE)
// In the view's navbar 4 ex: <% if (locals.var) { <%= var.name %> } %>
// -------------------------------------------------------------------------- //
// COOKIES
// SUCH A GLOBAL MIDDLEWARE (APP LEVEL) IS USEFUL WITH COOKIES
// if (req.cookies && req.cookies.userEmail)
// let cookieEmail = req.cookies.userEmail // same as used in remember user (login)
// the i have to cross that email with the ones that belong to my users DB:
// let userCookie = (users[i].email == cookieEmail);
// if (userCookie) {  // that means we've got a match
//  req.session.loggedUser = userCoookie;
// };
// -------------------------------------------------------------------------- //
// TO MAKE A MIDDLEWARE BUT ON A ROUTE LEVEL
// (WITH SESSION)
// let guestMiddleware / userMiddleware = (req,res,next) {
//  if (req.session.loggedUser / !req.session.loggedUser) {
//      res.redirect('/'); / res.redirect('/users/login');
//  };
//  next();
// };
// module.exports = middleware;
// and apply each like this:
// router.get('/register', guestMiddleware, renderRegister);
// router.get('/user/user', userMiddleware, renderUserProfile);
// -------------------------------------------------------------------------- //
// EXPRESS VALIDATOR
// let { check } = require('express-validator');
// let validations = [
//  check('fieldName')
//      .notEmpty().withMessage('Fill me').bail()
//      .normalizeEmail().isEmail().withMessage('Has to be e-mail'),
    // check('passwordCheck')
    //         .notEmpty().withMessage('Completa este campo').bail()
    //         .custom((match, { req }) => {
    //             let password = req.body.password;
    //             if (password != match) {
    //                 throw new Error('Las contraseñas no coinciden');
    //             } else {
    //                 return true;
    //             };
    //         }).bail(),
//  ];
// router.post('/register', validations, registerProcess);
// -------------------------------------------------------------------------- //
// URL MIDDLEWARE: CURRENT BUILD && DEVELOPMENT, ETC
// let urlMiddleware = (req, res, next) => {
//     res.locals.currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
//     next();
// };
// -------------------------------------------------------------------------- //
// module.exports = middleware;