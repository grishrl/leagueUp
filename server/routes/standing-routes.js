const utils = require('../utils');
const router = require('express').Router();
const Standings = require('../methods/standings-methods');
const passport = require("passport");
const { commonResponseHandler } = require('./../commonResponseHandler');

//gets the standings for provided division a divisionConcat,
//calculates the standings based on reported matches associated with provided division

router.post('/fetch/division', (req, res) => {
    const path = 'standings/fetch/division';

    const requiredParameters = [{
        name: 'division',
        type: 'string'
    }, {
        name: 'season',
        type: 'number'
    }];

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let division = requiredParameters.division.value;
        let season = requiredParameters.season.value;
        let pastSeason = req.body.pastSeason;
        return Standings.calculateStandings(division, season, pastSeason, false).then(
            (processed) => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Calculated Standings', false, processed)
                return response;
            },
            (err) => {
                response.status = 500
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting standings', err)
                return response;
            }
        )
    })


});

module.exports = router;