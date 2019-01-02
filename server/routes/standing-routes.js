const util = require('../utils');
const router = require('express').Router();
const Standings = require('../subroutines/standings-subs');
const passport = require("passport");

//gets the standings for provided division a divisionConcat,
//calculates the standings based on reported matches associated with provided division

router.post('/get/division', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const path = 'standings/get/division'
    let division = req.body.division;
    Standings.calulateStandings(division).then(
        (processed) => {
            res.status(200).send(util.returnMessaging(path, 'Calculated Standings', false, processed));
        },
        (err) => {
            res.status(500).send(util.returnMessaging(path, 'Error getting standings', err));
        }
    )
});

module.exports = router;