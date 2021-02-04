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
    console.log('redirect starting...');
    const start = Date.now();
    passport.authenticate('bnet', function(err, user, info) {
        if (err) {
            console.log('err ... ', Date.now() - start);
            util.errLogger('/bnet/redirect', err);
        }
        if (!user) {
            console.log('no user base redirect ... ', Date.now() - start);
            res.redirect('/');
        }
        if (user) {
            console.log('sending to user page ... ', Date.now() - start);
            var encode = encodeURIComponent(JSON.stringify(user));
            res.redirect('/login/' + encode);
        }
        console.log('uncaught ... lost in the void ... ', Date.now() - start);
    })(req, res, next);
});

router.get('/heartbeat', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = '/auth/heartbeat';
    res.status(200).send(util.returnMessaging(path, 'Token Good', false, { 'message': 'OK' }));
})


module.exports = router;