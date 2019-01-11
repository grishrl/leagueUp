const router = require("express").Router();
const passport = require("passport");
const util = require('../utils');

//auth with google
// router.get('/google', passport.authenticate('google', {
//     scope: ['profile']
// }));

//auth logout
router.get('/logout', (req, res) => {
    const path = '/auth/logout'
        //handle with passport
    req.logout();
    res.status(200).send(util.returnMessaging(path, "Logged out"));
});

router.get('/bnet', passport.authenticate('bnet', {
    scope: ['profile']
}));

//callback route for google
// router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
//     // res.send(req.user);
//     res.redirect('/profile/' + req.user._id);
// });

router.get('/bnet/redirect', function(req, res, next) {
    passport.authenticate('bnet', function(err, user, info) {
        if (err) {
            console.log('there was an error: ', err);
        }
        if (!user) {
            res.redirect('/');
        }
        if (user) {
            var encode = encodeURIComponent(JSON.stringify(user));
            res.redirect('/login/' + encode);
        }
    })(req, res, next);
});



// passport.authenticate('bnet', {
//     failureRedirect: '/'
// }, function(err, user, info) {
//     console.log('this is in place of the DONE / serializer');
//     if (err) {
//         console.log("We have an error!");
//     }
//     if (!user) {
//         res.redirect('/');
//     }
//     if (user) {
//         console.log('this is the user ', user);
//         console.log('/bnet/redirect ');
//         res.set('authToken', user.token);
//         res.redirect('/profile/' + user.displayName);
//     }
// }));

// app.get('/login', function (req, res, next) {
//     passport.authenticate('local', function (err, user, info) {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             return res.redirect('/login');
//         }
//         req.logIn(user, function (err) {
//             if (err) {
//                 return next(err);
//             }
//             return res.redirect('/users/' + user.username);
//         });
//     })(req, res, next);
// });


module.exports = router;