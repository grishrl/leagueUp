const router = require("express").Router();
const passport = require("passport");
const util = require('../utils');



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

router.get('/heartbeat', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/auth/heartbeat';
    res.status(200).send(util.returnMessaging(path, 'Token Good', false, { 'message': 'OK' }));
})


module.exports = router;