const Team = require('../models/team-models');
const Match = require('../models/match-model');
const CasterReportMethod = require('../methods/casterReportMethods');
const utils = require('../utils');
const passport = require("passport");
const _ = require('lodash');
const router = require('express').Router();
const levelRestrict = require("../configs/admin-leveling");
const scheduleGenerator = require('../subroutines/schedule-subs');
const Scheduling = require('../models/schedule-models');
const Division = require('../models/division-models');
const matchCommon = require('../methods/matchCommon');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const archiveMethods = require('../methods/archivalMethods');
const AWS = require('aws-sdk');
const { commonResponseHandler } = require('./../commonResponseHandler');
const getMatches = require('../methods/matches/getMatchesBy');



/**
 * returns matches that are generated
 * accepts season, division, round
 * return matches that fit the criterea
 * 
 */
router.post('/fetch/matches', async(req, res) => {
    const path = 'schedule/fetch/matches';

    const requiredParameters = [{
        name: 'season',
        type: 'number'
    }]

    const optionalParameters = [{
        name: 'division',
        type: 'string'
    }, {
        name: 'round',
        type: 'number'
    }]

    commonResponseHandler(req, res, requiredParameters, optionalParameters, async(req, res, requiredParameters, optionalParameters) => {
        const response = {};
        let season = requiredParameters.season.value;

        let query = {
            $and: []
        };

        if (season) {
            query.$and.push({
                season: season
            });
        }
        if (optionalParameters.round.valid) {
            query.$and.push({
                round: optionalParameters.round.value
            });
        }
        if (optionalParameters.division.valid) {
            query.$and.push({
                divisionConcat: optionalParameters.division.value
            });
        }

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        let pastSeason = season != currentSeasonInfo.value;

        return Match.find(query).lean().then((found) => {
            if (found) {
                if (pastSeason) {
                    return matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed)
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
                            return response;
                        })
                } else {
                    return matchCommon.addTeamInfoToMatch(found).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed);
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err);
                            return response;
                        })
                }

            } else {
                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, 'No matches found for criteria', false, found);
                return response;
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding matches', err)
            return response;
        });

    });
});

router.get('/get/grandchampions', async(req, res) => {
    const path = '/schedule/get/grandchampions'

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        let query = {
            $and: [{
                    type: 'grandfinal'
                },
                {
                    reported: true
                }
            ]
        };

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();

        let foundMatches = await Match.find(query).lean().then(
            found => {
                return found;
            },
            err => {
                utils.errLogger(req.originalUrl, err.message);
                return false;
            }
        );

        if (foundMatches) {
            let finalsBySeason = {};

            foundMatches = foundMatches.sort((a, b) => {
                if (a > b) {
                    return true;
                } else {
                    return false;
                }
            });

            for (var i = 1; i < currentSeasonInfo.value; i++) {

                foundMatches.forEach(m => {
                    if (m.season == i) {
                        if (utils.returnBoolByPath(finalsBySeason, `${i}.rawMatches`)) {
                            finalsBySeason[i].rawMatches.push(m);
                        } else {
                            finalsBySeason[i] = {
                                rawMatches: [m]
                            };
                        }
                    }
                });

            }

            let keys = Object.keys(finalsBySeason);

            for (var i = 0; i < keys.length; i++) {
                let key = keys[i];
                let matches = finalsBySeason[key].rawMatches;
                let processedMatches = await matchCommon.addTeamInfoFromArchiveToMatch(matches, key).then(
                    processed => {
                        return processed;
                    },
                    err => {
                        return null;
                    }
                );

                finalsBySeason[key]['processedMatches'] = processedMatches;
            }

            response.status = 200;
            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, finalsBySeason);

        } else {
            response.status = 400;
            response.message = utils.returnMessaging(req.originalUrl, 'Could not find matches', null, []);
        }
        return response;
    })

});

router.post('/fetch/reported/matches', async(req, res) => {

    const path = 'schedule/fetch/reported/matches';


    const requiredParameters = [{
        name: 'season',
        type: 'number'
    }]
    const optionalParameters = [{
        name: 'division',
        type: 'string'
    }, {
        name: 'sortOrder',
        type: 'string'
    }, {
        name: 'limit',
        type: 'number'
    }]

    commonResponseHandler(req, res, requiredParameters, optionalParameters, async(req, res, requiredParameters, optionalParameters) => {
        const response = {};


        return getMatches.returnReportedMatches(requiredParameters.season.value,
            optionalParameters.division.value, optionalParameters.sortOrder.value, optionalParameters.limit.value).then(
            matches => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, matches)
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting matches', err)
                return response;
            }
        );

    })

});

/**
 * returns matches that are generated
 * accepts season, division, round
 * return matches that fit the criterea
 * 
 */
router.post('/fetch/division/matches', (req, res) => {
    const path = 'schedule/fetch/division/matches';

    const requiredParameters = [{
        name: 'season',
        type: 'number'
    }, {
        name: 'division',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let season = requiredParameters.season.value;
        let division = requiredParameters.division.value;
        return Match.find({
            $and: [{
                    season: season
                },
                {
                    divisionConcat: division
                }
            ]
        }).lean().then((found) => {
            if (found) {
                let teams = findTeamIds(found);
                return addTeamNamesToMatch(teams, found).then((processed) => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found matches', false, processed)
                    return response;
                }, (err) => {
                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
                    return response;
                });
            } else {
                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, 'No matches found for criteria', false, found)
                return response;
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding matches', err)
            return response;
        });

    });
});

/*
 */
router.post('/fetch/matches/all',
    passport.authenticate('jwt', {
        session: false
    }), utils.appendResHeader, (req, res) => {
        const path = 'schedule/fetch/matches/all';

        commonResponseHandler(req, res, [], [], async(req, res) => {
            const response = {};
            return Match.find().lean().then((found) => {
                if (found) {
                    let teams = findTeamIds(found);
                    return addTeamNamesToMatch(teams, found).then((processed) => {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'Found matches', false, processed)
                        return response;
                    }, (err) => {
                        response.status = 400;
                        response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
                        return response;
                    });
                } else {
                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'No matches found for criteria', false, found)
                    return response;
                }
            }, (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding matches', err)
                return response;
            });
        });

    });


//match query route
router.post('/query/matches',
    passport.authenticate('jwt', {
        session: false
    }), (req, res) => {
        const path = '/schedule/query/matches';
        if (Object.keys(req.body).length == 0) {
            res.status(500).send(utils.returnMessaging(req.originalUrl, 'No query provided', err))
        } else {
            commonResponseHandler(req, res, [], [], async(req, res) => {
                const response = {};
                return Match.find(req.body).lean().then(
                    found => {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'Query results', false, found)
                        return response;
                    },
                    err => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'Query Error', err);
                        return response;
                    }
                )
            })
        }
    });

router.get('/get/matches/casted/playing', (req, res) => {
    const path = 'schedule/get/matches/casted/playing';

    const start = Date.now();

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        let now = Date.now();
        let query = {
            $and: [{
                    casterUrl: {
                        $exists: true
                    }
                }, {
                    casterUrl: {
                        $ne: ""
                    }
                }, {
                    "scheduledTime.endTime": {
                        $gt: now
                    }
                },
                {
                    "scheduledTime.startTime": {
                        $lt: now
                    }
                }
            ]
        }

        return Match.find(query).lean().then((found) => {
            if (found) {
                let teams = findTeamIds(found);
                return addTeamNamesToMatch(teams, found).then((processed) => {

                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found matches', false, processed)
                    return response;
                }, (err) => {

                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
                    return response;
                });
            } else {

                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'No matches found for criteria', false, found)
                return response;
            }
        }, (err) => {

            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding matches', err)
            return response;
        });
    })
});

router.post('/fetch/matchup/history', (req, res) => {

    const path = 'schedule/fetch/matchup/history';

    const requiredParameters = [{
        name: 'teamAid',
        type: 'string'
    }, {
        name: 'teamBid',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let query = {
            $and: [{
                    $or: [{
                            $and: [{
                                    "home.id": requiredParameters.teamAid.value
                                },
                                {
                                    "away.id": requiredParameters.teamBid.value
                                }
                            ]
                        },
                        {
                            $and: [{
                                    "home.id": requiredParameters.teamBid.value
                                },
                                {
                                    "away.id": requiredParameters.teamAid.value
                                }
                            ]
                        }
                    ]
                },
                {
                    reported: true
                }
            ]
        };

        return Match.find(query).then(
            found => {
                return matchCommon.addTeamInfoToMatch(found).then(ret => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found matches', null, ret)
                    return response;
                })
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting matches', err)
                return response;
            }
        )
    });

});
/**
 * returns matches that are generated
 * accepts season, team
 * return matches that fit the criterea
 * 
 */
router.post('/fetch/matches/team', async(req, res) => {
    const path = 'schedule/fetch/matches/team';

    const requiredParameters = [{
        name: 'season',
        type: 'number'
    }, {
        name: 'team',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let team = requiredParameters.team.value;
        let season = requiredParameters.season.value;

        let pastSeason = false;

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        console.log(currentSeasonInfo);
        pastSeason = season != currentSeasonInfo.value;

        team = team.toLowerCase();
        let foundTeam;
        if (pastSeason) {
            console.log('111');
            foundTeam = await archiveMethods.getTeamFromArchiveByNameSeason(team, season);
        } else {
            console.log('zzz');
            foundTeam = await Team.findOne({
                teamName_lower: team
            }).then((fT) => {
                console.log('ft',fT);
                if (fT) {
                    return fT;
                } else {
                    return null;
                }
            }, (err) => {
                return null;
            });
        }

        if (foundTeam) {

            let teamId = foundTeam._id;
            return Match.find({
                $and: [{
                        $or: [{
                            'away.id': teamId
                        }, {
                            'home.id': teamId
                        }]
                    },
                    {
                        season: season
                    },
                    {
                        type: {
                            $ne: "tournament"
                        }
                    }
                ]
            }).lean().then((foundMatches) => {
                if (pastSeason) {
                    return matchCommon.addTeamInfoFromArchiveToMatch(foundMatches, season).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed);
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Failed to get team matches', err)
                            return response;
                        })
                } else {
                    return matchCommon.addTeamInfoToMatch(foundMatches).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed)
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err);
                            return response;
                        })
                }
            }, (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Failed to get team matches', err)
                return response;
            });
        } else {

            response.status = 400
            response.message = utils.returnMessaging(req.originalUrl, 'No matches found.')
        }

        return response;
    });

})

/*

*/
router.get('/get/matches/scheduled', async(req, res) => {
    const path = 'schedule/get/matches/scheduled';

    commonResponseHandler(req, res, [], [], async(req, res) => {

        return getScheduledMatches(req);

    });

});

/*

this route accepts additional query parameters and options to further narrow down the query return

the query parameter must be an array of objects of additional QUERY objects to add to the existing;

the options is an object of query options.

*/


router.post('/fetch/matches/scheduled', async(req, res) => {
    const path = 'schedule/fetch/matches/scheduled';

    const optionalParameters = [{
            name: 'query',
            type: 'array'
        },
        {
            name: 'options',
            type: 'object'
        }
    ];

    commonResponseHandler(req, res, [], optionalParameters, async(req, res, required, options) => {

        let adQuery = {};

        if (options.options.valid) {
            adQuery.options = options.options.value;
        }

        if (options.query.valid) {
            adQuery.query = options.query.value;
        }

        return getScheduledMatches(req, adQuery);
    })

})


async function getScheduledMatches(req, additionalQuery) {
    const response = {};
    let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    let season = currentSeasonInfo.value;
    let query = {
        $and: [{
                'scheduledTime.startTime': {
                    $exists: true
                }
            },
            {
                'scheduledTime.startTime': {
                    $ne: null
                }
            },
            {
                season: season
            }
        ]
    }

    let options = null;

    if (additionalQuery) {

        if (additionalQuery.options) {
            options = additionalQuery.options
        }

        if (additionalQuery.query) {
            additionalQuery.query.forEach(q => {
                query.$and.push(q);
            })
        }

    }

    return Match.find(query, null, options).lean().then((found) => {
        if (found) {
            let teamIds = findTeamIds(found);
            return addTeamAndDivsionNames(found).then(
                added => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found scheduled matches', false, added);
                    return response;
                },
                err => {
                    response.status = 500
                    response.message = utils.returnMessaging(req.originalUrl, 'Failed to get team matches', err, false)
                    return response;
                }
            );
        } else {
            response.status = 400;
            response.message = utils.returnMessaging(req.originalUrl, 'No matches found')
            return response;
        }
    }, (err) => {
        response.status = 400;
        response.message = utils.returnMessaging(req.originalUrl, 'Error in query', err)
        return response;
    });
}

router.post('/update/match/time', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, (req, res) => {
    const path = 'schedule/update/match/time';

    const requiredParameters = [{
        name: 'matchId',
        type: 'string'
    }, {
        name: 'scheduledStartTime',
        type: 'number'
    }, {
        name: 'scheduledEndTime',
        type: 'number'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let requester = req.user.displayName;
        let matchId = requiredParameters.matchId.value;
        let scheduledStartTime = requiredParameters.scheduledStartTime.value;
        let scheduledEndTime = requiredParameters.scheduledEndTime.value;

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = 'schedule match';
        logObj.target = matchId;
        logObj.logLevel = 'STD';

        return Match.findOne({
            matchId: matchId
        }).then((foundMatch) => {
            if (foundMatch) {
                let teams = findTeamIds([foundMatch.toObject()]);
                return Team.find({
                    _id: {
                        $in: teams
                    }
                }).lean().then((foundTeams) => {
                    let isCapt = returnIsCapt(foundTeams, requester);
                    if (isCapt) {
                        if (utils.returnBoolByPath(foundMatch.toObject(), 'scheduledTime')) {
                            if (foundMatch.scheduledTime.priorScheduled) {
                                logObj.logLevel = 'ERROR';
                                logObj.error = 'Match has all ready been scheduled';
                                response.status = 400
                                response.message = utils.returnMessaging(req.originalUrl, 'Match has all ready been scheduled', false, null, null, logObj)
                                return response;
                            } else {
                                foundMatch.scheduledTime.priorScheduled = true;
                                foundMatch.scheduledTime.startTime = scheduledStartTime;
                                foundMatch.scheduledTime.endTime = scheduledEndTime;
                            }
                        } else {
                            foundMatch.scheduledTime = {};
                            foundMatch.scheduledTime.priorScheduled = true;
                            foundMatch.scheduledTime.startTime = scheduledStartTime;
                            foundMatch.scheduledTime.endTime = scheduledEndTime;
                        }
                        foundMatch.markModified('scheduledTime');
                        return foundMatch.save().then(
                            (saved) => {
                                response.status = 200;
                                response.message = utils.returnMessaging(req.originalUrl, 'Match schedule saved', false, saved, null, logObj)
                                return response;
                            }, (err) => {
                                response.status = 500
                                response.message = utils.returnMessaging(req.originalUrl, 'Error updating match time.', err, null, null, logObj)
                                return response;
                            }
                        )
                    } else {
                        logObj.logLevel = 'ERROR';
                        logObj.error = 'Requester is not authorized';
                        response.status = 403
                        response.message = utils.returnMessaging(req.originalUrl, 'Requester is not authorized', null, null, null, logObj)
                        return response;
                    }
                }, (err) => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error updating match time.', err, null, null, logObj)
                    return response;
                });
            } else {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error updating match time.', err, null, null, logObj)
                return response;
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error updating match time.', err, null, null, logObj)
            return response;
        });

    })

})

/*
for getting a match specified by ID
*/
router.post('/fetch/match', async(req, res) => {
    const path = 'schedule/fetch/match';

    const requiredParameters = [{
        name: 'matchId',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let matchId = requiredParameters.matchId.value;
        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();

        return Match.findOne({
            matchId: matchId
        }).lean().then((foundMatch) => {
            if (foundMatch) {
                let matchSeason = foundMatch.season
                let pastSeason = matchSeason != currentSeasonInfo.value;
                if (pastSeason) {
                    return matchCommon.addTeamInfoFromArchiveToMatch(foundMatch, matchSeason).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found match', null, processed[0]);
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
                            return response;
                        })
                } else {
                    return matchCommon.addTeamInfoToMatch(foundMatch).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found match', null, processed[0])
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
                            return response;
                        })
                }
            } else {
                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, 'No matches found for criteria', false, foundMatch)
                return response;
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error getting match', err)
            return response;
        });
    });

});

router.post('/fetch/match/list', async(req, res) => {
    const path = 'schedule/fetch/match/list';



    const requiredParameters = [{
        name: 'matches',
        type: 'array'
    }]

    const optionalParameters = []

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        // let matches = requiredParameters.matches.value;
        let matches = req.body.matches;

        let season = req.body.season;
        let pastSeason = false;

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        pastSeason = season != currentSeasonInfo.value;



        return Match.find({
            matchId: {
                $in: matches
            }
        }).lean().then(
            found => {
                if (pastSeason) {
                    return matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed);
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err);
                            return response;
                        })
                } else {
                    return matchCommon.addTeamInfoToMatch(found).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed);
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err);
                            return response;
                        })
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting match', err);
                return response;
            }
        )
    });

});


/*
for reporting matches and injesting replay files
*/
router.post('/report/match', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, async(req, res) => {
    const path = '/schedule/report/match';



    let matchReport = req.body;

    if (Object.keys(matchReport).length > 0) {
        commonResponseHandler(req, res, [], [], async(req, res) => {
            const response = {};
            let requester = req.user.displayName;
            const rM = require('../methods/matches/report-match');
            return rM(path, matchReport, requester).then(
                succ => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Match Reported!', null, succ)
                    return response;
                }, err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error reporting match result', err, null)
                    return response;
                }
            )
        })
    } else {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'Match result missing', err, null));
    }

});

router.post('/report/cast', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, async(req, res) => {
    const path = '/schedule/report/cast';


    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};


        // if()
        let castReportObject = req.body.report;

        // some matches might be part of events or qualifier tournaments, lets zip this up now on the server to simplify the client work
        // if (castReportObject.division == "undefined" || castReportObject.division == "null" || castReportObject.division == null || castReportObject.division == undefined || castReportObject.length == 0) {
        if (utils.returnBoolByPath(castReportObject, 'division') == false) {
            let query = {
                matches: castReportObject.matchId
            }

            let parentSchedule = await queryScheduling(query);
            if (parentSchedule) {
                parentSchedule = utils.objectify(parentSchedule[0]);
                castReportObject.event = parentSchedule.name;
            }

        }

        return CasterReportMethod.upsertCasterReport(castReportObject).then(
            saved => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Match Reported!', null, saved)
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error reporting match result', err, null)
                return response;
            }
        );
    });

});

router.get('/report/cast', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, async(req, res) => {
    const path = '/schedule/report/cast';

    let required = [{
        name: 'matchId',
        type: 'string'
    }];

    commonResponseHandler(req, res, required, [], async(req, res, required) => {
        const response = {};
        return CasterReportMethod.getCasterReport(required.matchId.value).then(
            saved => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found Cast Report', null, saved)
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting cast report', err, null)
                return response;
            }
        );
    });

});

router.get('/report/cast/uncurrated', passport.authenticate('jwt', {
    session: false
}), utils.appendResHeader, async(req, res) => {
    const path = '/schedule/report/cast/uncurrated';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        return CasterReportMethod.getUnCurratedReports().then(
            saved => {
                let toReturn = [];
                let totalVideos = 0;
                saved.forEach(
                    s => {
                        totalVideos = totalVideos + s.vodLinks.length;
                        if (totalVideos < 45) {
                            toReturn.push(s);
                        }
                    }
                );
                returnObject = {
                    reportList: toReturn,
                    thisBatch: toReturn.length,
                    totalBatch: saved.length
                }
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found Cast Report', null, returnObject)
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting cast report', err, null)
                return response;
            }
        );
    });

});

/*
this is to add a caster to a match
*/
router.post('/match/add/caster', passport.authenticate('jwt', {
    session: false
}), levelRestrict.casterLevel, utils.appendResHeader, (req, res) => {
    let path = 'schedule/match/add/caster';

    const optionalParameters = [{
        name: 'matchId',
        type: 'string'
    }, {
        name: 'casterName',
        type: 'string'
    }, {
        name: 'casterUrl',
        type: 'string'
    }]

    commonResponseHandler(req, res, [], optionalParameters, async(req, res, required, options) => {
        const response = {};
        let matchid = options.matchId.value;
        let casterName = options.casterName.valid ? options.casterName.value : '';
        let casterUrl = options.casterUrl.valid ? options.casterName.value : '';

        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' add caster ';
        logObj.logLevel = 'STD';
        logObj.target = matchid;

        await Match.findOne({
            matchId: matchid
        }).then((found) => {
            if (found) {
                found.casterName = casterName;
                found.casterUrl = casterUrl;
                return found.save().then(
                    (saved) => {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'Match updated', false, saved, null, logObj)
                        return response;
                    },
                    (err) => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'Error updating match', err, null, null, logObj)
                        return response;
                    }
                )
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Could not find match';
                response.status = 400;
                response.message = utils.returnMessaging(req.originalUrl, 'Could not find match', false, found, null, logObj)
                return response;
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error updating match', err, null, null, logObj)
            return response;
        });

        return response;
    });

});

/*
this is to returns a casters matches
*/
router.post('/match/fetch/mycasted', passport.authenticate('jwt', {
    session: false
}), levelRestrict.casterLevel, utils.appendResHeader, async(req, res) => {
    let path = 'schedule/match/fetch/mycasted';

    if (req.user.hasOwnProperty('twitch') && req.user.hasOwnProperty('casterName')) {
        //log object
        //comeback
        commonResponseHandler(req, res, [], [], async(req, res) => {
            const response = {};
            let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();

            let query = {
                $and: [{
                        season: currentSeasonInfo.value
                    },
                    {
                        $or: [{
                                casterUrl: req.user.twitch
                            },
                            {
                                casterName: req.user.casterName
                            }
                        ]
                    }
                ]
            };

            return Match.find(query).lean().then((found) => {
                if (found) {
                    return matchCommon.addTeamInfoToMatch(found).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found match', false, processed, null)
                            return response;
                        },
                        err => {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error finding match', err, null, null);
                            return response;
                        }
                    )
                } else {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Could not find match', false, found, null);
                    return response;
                }
            }, (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding match', err, null, null)
                return response;
            });
        })

    } else {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'No Twitch On Profile', null, null, null));
    }

});

/*
this is for casters to one click claim a match
*/
router.post('/match/add/caster/occ', passport.authenticate('jwt', {
    session: false
}), levelRestrict.casterLevel, utils.appendResHeader, (req, res) => {
    let path = 'schedule/match/add/caster/occ';


    if (req.user.hasOwnProperty('twitch') && req.user.hasOwnProperty('casterName')) {
        //log object
        const requiredParameters = [{
            name: 'matchId',
            type: 'string'
        }]
        commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
            const response = {};
            let matchid = requiredParameters.matchId.value;
            let logObj = {};
            logObj.actor = req.user.displayName;
            logObj.action = ' add caster ';
            logObj.logLevel = 'STD';
            logObj.target = matchid;

            return Match.findOne({
                matchId: matchid
            }).then((found) => {
                if (found) {
                    found.casterName = req.user.casterName;
                    found.casterUrl = req.user.twitch;
                    return found.save().then(
                        (saved) => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Match updated', false, saved, null, logObj)
                            return response;
                        },
                        (err) => {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error updating match', err, null, null, logObj)
                            return response;
                        }
                    )
                } else {
                    logObj.logLevel = 'ERROR';
                    logObj.error = 'Could not find match';
                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'Could not find match', false, found, null, logObj);
                    return response;
                }
            }, (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error updating match', err, null, null, logObj);
                return response;
            });
        })

    } else {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'No Twitch On Profile', null, null, null));
    }

});


/*
generates the schedules
*/
router.post('/generate/schedules', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, utils.appendResHeader, (req, res) => {
    const path = 'schedule/generate/schedules';


    const requiredParameters = [{
        name: 'season',
        type: 'number'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let season = requiredParameters.season.value;
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' generated season schedules ';
        logObj.logLevel = 'STD';
        logObj.target = 'season: ' + season;
        return scheduleGenerator.generateSeasonTwo(season).then((process) => {
            if (process) {
                scheduleGenerator.generateRoundRobinScheduleTwo(season);
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Schedules generating', false, null, null, logObj)
                return response;
            } else {
                logObj.logLevel = 'ERROR';
                logObj.error = 'Error occured in schedule generator, got null schedule';
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error occured in schedule generator', false, null, null, logObj)
                return response;
            }
        }, (err) => {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error occured in schedule generator', err, null, null, logObj)
            return response;
        })
    })

});

router.post('/check/valid',
    passport.authenticate('jwt', {
        session: false
    }), levelRestrict.scheduleGenerator, utils.appendResHeader, (req, res) => {
        const path = 'schedule/check/valid';



        const requiredParameters = [{
            name: 'season',
            type: 'number'
        }]

        commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
            const response = {};
            let season = requiredParameters.season.value;
            let query = {
                $and: [{
                        season: season
                    },
                    {
                        type: {
                            $ne: "tournament"
                        }
                    }
                ]
            }

            return queryScheduling(query).then(
                found => {
                    if (found && found.length > 0) {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'Schedules found', false, {
                            "valid": false
                        })
                        return response;
                    } else {
                        response.status = 200;
                        response.message = utils.returnMessaging(req.originalUrl, 'Schedules empty', false, {
                            "valid": true
                        })
                        return response;
                    }
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Query Error', false, null, null, null)
                    return response;
                }
            )
        })

    });

router.post('/generate/tournament', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, utils.appendResHeader, (req, res) => {

    const path = '/schedule/generate/tournament';

    const requiredParameters = [{
        name: 'season',
        type: 'number'
    }, {
        name: 'teams',
        type: 'array'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let checkObj = {
            $and: [{
                type: 'tournament'
            }]
        }

        let target = '';
        let season;

        if (req.body.season) {
            season = req.body.season;
            target += 'season: ' + season;
            checkObj.$and.push({
                season: season
            });
        }

        let division;

        if (req.body.division) {
            division = req.body.division;
            target += ' division: ' + division;
            checkObj.$and.push({
                "division": division
            });
        }

        let cupNumber;
        if (req.body.cupNumber) {
            cupNumber = req.body.cupNumber;
            target += ' cup Number: ' + cupNumber;
            checkObj.$and.push({
                cupNumber: cupNumber
            });
        }


        let tournamentName;
        if (req.body.tournamentName) {
            tournamentName = req.body.tournamentName;
            target += ' tournamentName: ' + tournamentName;
            checkObj.$and.push({
                name: tournamentName
            });
        }

        let description;
        if (req.body.description) {
            description = req.body.description;
            target += ' description: ' + description;
        }

        let teams = req.body.teams;
        let teamids = [];
        teams.forEach(team => {
            let teamid = team._id ? team._id : team.id;
            if (teamids.indexOf(teamid) == -1) {
                teamids.push(teamid);
            }
        })
        checkObj.$and.push({
            participants: teamids
        });
        //log object
        let logObj = {};
        logObj.actor = req.user.displayName;
        logObj.action = ' generated tournament ';
        logObj.logLevel = 'STD';
        logObj.target = target;

        let type = req.body.type;


        return queryScheduling(checkObj).then(
            found => {
                if (found && found.length > 0) {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Tournament previously generated', false, null, null, logObj)
                    return response;
                } else {
                    return scheduleGenerator.generateTournament(teams, season, division, cupNumber, tournamentName, description, type).then((process) => {
                        if (process) {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Tournament generated', false, process, null, logObj);
                            return response;
                        } else {
                            logObj.logLevel = 'ERROR';
                            logObj.error = 'Error occured in schedule generator, got null Tournament'
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error 3 occured in Tournament generator', false, process, null, logObj)
                            return response;
                        }
                    }, (err) => {
                        response.status = 500;
                        response.message = utils.returnMessaging(req.originalUrl, 'Error 2 occured in Tournament generator', err, null, null, logObj)
                        return response;
                    })
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error 1 occured in Tournament generator', err, null, null, logObj)
                return response;
            }

        )
    });


});


router.get('/delete/tournament', passport.authenticate('jwt', {
    session: false
}), levelRestrict.scheduleGenerator, async(req, res) => {

    const path = '/schedule/delete/tournament';

    const requiredParameters = [{
        name: "tournId",
        type: "number"
    }];

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {

        const response = {};

        let tourn = requiredParameters.tournId.value;

        return Scheduling.findOneAndDelete({
            challonge_ref: tourn
        }).then(
            foundTourn => {
                if (foundTourn) {
                    return Match.deleteMany({
                        matchId: {
                            $in: utils.objectify(foundTourn).matches
                        }
                    }).then(
                        deleted => {
                            const deleteLoad = {
                                matches: deleted,
                                tournament: foundTourn
                            };
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Tournament Deleted', false, deleteLoad, null, null)
                            return response;
                        },
                        err => {
                            response.status = 500;
                            response.message = utils.returnMessaging(req.originalUrl, 'Deletion Error', err, null, null, null)
                            return response;
                        }
                    );

                } else {
                    response.status = 400;
                    response.message = utils.returnMessaging(req.originalUrl, 'Tournament Not Found', false, null, null, null)
                    return response;
                }
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Deletion Error', err, null, null, null)
                return response;
            });

    });

})

//this route retuns all tournament matches that a team participates in 
router.post('/fetch/team/tournament/matches', async(req, res) => {

    const path = '/schedule/fetch/team/tournament/matches';

    const requiredParameters = [, {
        name: 'teamId',
        type: 'string'
    }, {
        name: 'season',
        type: 'number'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let queryObj = {
            $and: [{
                    $or: [{
                            "home.id": requiredParameters.teamId.value
                        },
                        {
                            "away.id": requiredParameters.teamId.value
                        }
                    ]
                },
                {
                    "type": "tournament"
                }
            ]
        };

        let season = requiredParameters.season.value;
        queryObj.$and.push({
            season: requiredParameters.season.value
        });

        if (req.body.division) {
            queryObj.$and.push({
                divisionConcat: req.body.division
            });
        }

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        let pastSeason = season != currentSeasonInfo.value;

        return Match.find(queryObj).lean().then(
            (found) => {
                if (pastSeason) {
                    return matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed)
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
                            return response;
                        })
                } else {
                    return matchCommon.addTeamInfoToMatch(found).then(
                        processed => {
                            response.status = 200;
                            response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed)
                            return response;
                        },
                        err => {
                            response.status = 400;
                            response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err);
                            return response;
                        })
                }

            },
            (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error occured querying schedules', err)
                return response;
            }
        )
    });

});

//get past tournaments non-seasonal tournamnets
router.get('/get/tournament/past', async(req, res) => {

    const path = '/schedule/get/tournament/past';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        let returnArray = [];

        let pastSeason = false;

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();

        let tournaments = await queryScheduling({
            $and: [{
                active: false
            }, {
                "division": null
            }]
        });

        if (tournaments) {
            let tournIds = [];

            parseTournamentReturnObjects(tournaments, returnArray, tournIds);

            let queryObj = {
                $and: [{
                        "type": "tournament"
                    },
                    {
                        'challonge_tournament_ref': {
                            $in: tournIds
                        }
                    }
                ]
            };

            let matches = await Match.find(queryObj).then(found => {
                return found;
            }, err => {
                throw err;
            });
            // let matches = await returnFullMatchInfo(queryObj, pastSeason);
            let pastSeasonMatches = {};
            let currentSeasonMatches = [];
            matches.forEach(
                match => {
                    if (match.season == currentSeasonInfo.value) {
                        currentSeasonMatches.push(match);
                    } else {
                        if (!utils.returnBoolByPath(pastSeasonMatches, match.season.toString())) {
                            pastSeasonMatches[match.season] = [match];
                        } else {
                            pastSeasonMatches[match.season].push(match);
                        }
                    }
                }
            );

            currentSeasonMatches = await matchCommon.addTeamInfoToMatch(currentSeasonMatches).then(proc => {
                return proc;
            });

            let keys = Object.keys(pastSeasonMatches);

            for (var i = 0; i < keys.length; i++) {
                let key = keys[i];
                pastSeasonMatches[key] = await matchCommon.addTeamInfoFromArchiveToMatch(pastSeasonMatches[key], key).then(proc => {
                    return proc;
                });
            }

            let concatMatches = [];
            concatMatches = concatMatches.concat(currentSeasonMatches);
            for (var i = 0; i < keys.length; i++) {
                let key = keys[i];
                concatMatches = concatMatches.concat(pastSeasonMatches[key]);
            }


            if (concatMatches) {

                associateTournamentsAndMatches(concatMatches, returnArray);

                response.status = 200
                response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, returnArray)
                    // res.status(200).send(utils.returnMessaging(req.originalUrl, 'Found these matches', null, returnArray));
            } else {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding team tournament matches', null, returnArray);
                // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding team tournament matches', null, returnArray));
            }
        } else {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding active tournaments', null, returnArray);
            // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding active tournaments', null, returnArray));
        }
        return response;
    })

});


//this returns all the tournaments the team has particapted in
router.post('/fetch/team/tournament', (req, res) => {

    const path = '/schedule/fetch/team/tournament';

    let team = req.body.teamId;

    const requiredParameters = [{
        name: 'teamId',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        return queryScheduling({
            participants: requiredParameters.teamId.value
        }).then(
            (found) => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found tournament info', false, found)
                return response;
            },
            (err) => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error occured querying schedules', err)
                return response;
            }
        );
    })


});

//this route takes a team id and returns all the active tournaments; regardless of season.
router.get('/fetch/tournament/active', async(req, res) => {

    const path = '/schedule/fetch/tournament/active';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        let returnArray = [];

        let pastSeason = false;

        let tournaments = await queryScheduling({
            active: true
        });

        if (tournaments) {
            let tournIds = [];

            parseTournamentReturnObjects(tournaments, returnArray, tournIds);

            let queryObj = {
                $and: [{
                        "type": "tournament"
                    },
                    {
                        'challonge_tournament_ref': {
                            $in: tournIds
                        }
                    }
                ]
            };

            let matches = await returnFullMatchInfo(queryObj, pastSeason);

            if (matches) {

                associateTournamentsAndMatches(matches, returnArray);
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, returnArray);
                // res.status(200).send(utils.returnMessaging(req.originalUrl, 'Found these matches', null, returnArray));
            } else {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding team tournament matches', null, returnArray)
                    // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding team tournament matches', null, returnArray));
            }
        } else {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding active tournaments', null, returnArray);
            // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding active tournaments', null, returnArray));
        }
        return response;
    })



});

//this route takes a team id and returns all the active tournaments for the team; regardless of season.
router.post('/fetch/team/tournament/active', async(req, res) => {

    const path = '/schedule/fetch/team/tournament/active';



    const requiredParameters = [{
        name: 'teamId',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        let team = requiredParameters.teamId.value;

        let returnArray = [];

        let pastSeason = false;

        let tournaments = await queryScheduling({
            $and: [{
                    participants: team
                },
                {
                    active: true
                }
            ]
        });

        if (tournaments) {
            let tournIds = [];

            parseTournamentReturnObjects(tournaments, returnArray, tournIds);

            let queryObj = {
                $and: [{
                        $or: [{
                                "home.id": team
                            },
                            {
                                "away.id": team
                            }
                        ]
                    },
                    {
                        "type": "tournament"
                    },
                    {
                        'challonge_tournament_ref': {
                            $in: tournIds
                        }
                    }
                ]
            };

            let matches = await returnFullMatchInfo(queryObj, pastSeason);

            if (matches) {

                associateTournamentsAndMatches(matches, returnArray);
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, returnArray)
                    // res.status(200).send(utils.returnMessaging(req.originalUrl, 'Found these matches', null, returnArray));
            } else {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding team tournament matches', null, returnArray);
                // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding team tournament matches', null, returnArray));
            }
        } else {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding active tournaments', null, returnArray)
                // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding active tournaments', null, returnArray));
        }

        return response;
    })




});

//this route takes a team id and returns all the tournaments for the team; given a season
router.post('/fetch/team/tournament/season', async(req, res) => {

    const path = '/schedule/fetch/team/tournament/season';

    const requiredParameters = [{
        name: 'teamId',
        type: 'string'
    }, {
        name: 'season',
        type: 'number'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};
        let team = requiredParameters.teamId.value;
        let season = requiredParameters.season.value;

        let returnArray = [];

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        let pastSeason = season != currentSeasonInfo.value;

        let tournaments = await queryScheduling({
            $and: [{
                    participants: team
                },
                {
                    season: season
                }
            ]
        });

        if (tournaments) {
            let tournIds = [];

            parseTournamentReturnObjects(tournaments, returnArray, tournIds);

            let queryObj = {
                $and: [{
                        $or: [{
                                "home.id": team
                            },
                            {
                                "away.id": team
                            }
                        ]
                    },
                    {
                        "type": "tournament"
                    },
                    {
                        'challonge_tournament_ref': {
                            $in: tournIds
                        }
                    }
                ]
            };

            let matches = await returnFullMatchInfo(queryObj, pastSeason, season);

            if (matches) {

                associateTournamentsAndMatches(matches, returnArray);

                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, returnArray)
                    // res.status(200).send(utils.returnMessaging(req.originalUrl, 'Found these matches', null, returnArray));
            } else {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error finding team tournament matches', null, returnArray)
                    // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding team tournament matches', null, returnArray));
            }
        } else {
            response.status = 500;
            response.message = utils.returnMessaging(req.originalUrl, 'Error finding active tournaments', null, returnArray)
                // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error finding active tournaments', null, returnArray));
        }
        return response;
    })

});

router.post('/fetch/tournament', (req, res) => {

    const path = '/schedule/fetch/tournament';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        let checkObj = {
            $and: [{
                type: 'tournament'
            }]
        }

        let season;
        if (req.body.season) {
            season = req.body.season;
            checkObj.$and.push({
                season: season
            });
        }

        let division;
        if (req.body.division) {

            division = req.body.division;

            checkObj.$and.push({
                "division": division
            });
        }

        let tournamentName;
        if (req.body.tournamentName) {
            tournamentName = req.body.tournamentName;
            checkObj.$and.push({
                name: tournamentName
            });
        }

        if (req.body.tournamentIds) {
            let tournIds = [];
            req.body.tournamentIds.forEach(id => {
                tournIds.push(parseInt(id));
            })
            checkObj.$and.push({
                challonge_ref: {
                    $in: tournIds
                }
            });
        }

        return queryScheduling(checkObj).then(
            found => {
                if (found) {
                    found = utils.objectify(found);
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Found tournament info', false, {
                        tournInfo: found
                    })
                    return response;
                    // res.status(200).send();
                } else {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'No tournament info found', false, found);
                    return response;
                    // res.status(200).send(utils.returnMessaging(req.originalUrl, 'No tournament info found', false, found));
                    //match not found
                }

            },
            err => {
                //query error
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error occured querying tournament', err)
                return response;
                // res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error occured querying tournament', err));
            }
        )
    })


});

router.get('/matchfiles', async(req, res) => {
    try {
        const s3Zip = require('s3-zip')

        const path = 'schedule/matchfiles';
        let match = req.query.match;

        // commonResponseHandler(req, res, [], [], async (req, res) => {
        //   const response = {};
        //   return response;
        // })

        //get the match requested from the data
        let matchData = await Match.findOne({
            matchId: match
        }).lean().then(
            found => {
                return found
            },
            err => {
                res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error getting match', err))
            }
        );

        if (utils.isNullorUndefined(matchData)) {
            res.status(404).send(utils.returnMessaging(req.originalUrl, 'Match not found'));
        }

        //use the match ID as the folder name
        var folderName = matchData.matchId;
        //create bans text string
        let bansText = `${matchData.home.teamName}: Bans ${matchData.mapBans.homeOne}, ${matchData.mapBans.homeTwo} \n${matchData.away.teamName}: Bans ${matchData.mapBans.awayOne}, ${matchData.mapBans.awayTwo}  `;

        AWS.config.update({
            accessKeyId: process.env.S3accessKeyId,
            secretAccessKey: process.env.S3secretAccessKey,
            region: process.env.S3region
        });

        const s3replayBucket = new AWS.S3({
            params: {
                Bucket: process.env.s3bucketReplays
            }
        });

        const s3makezipBucket = new AWS.S3({
            params: {
                Bucket: process.env.s3bucketMakeZip
            }
        });

        //create a buffer from the bans text
        let buffer = Buffer.from(bansText, "utf-8");

        let data = {
            Key: `${folderName}/bans.txt`,
            Body: buffer
        };
        //spool these all into a promise array so i can better track their resolution (times at least)..
        var promiseArray = [];

        //write bans text to S3 zip directory
        promiseArray.push(s3makezipBucket.putObject(data).promise());

        //copy the replays into the temp directory...
        let tempReplays = JSON.parse(JSON.stringify(matchData.replays));
        delete tempReplays._id;

        let replayKeys = Object.keys(tempReplays);

        let i = 0;
        for (i; i < replayKeys.length; i++) {
            let key = replayKeys[i];
            let replayInf = tempReplays[key];
            let toCopy = replayInf.url;
            const param = {
                CopySource: `${process.env.s3bucketReplays}/${toCopy}`,
                Bucket: process.env.s3bucketMakeZip,
                Key: `${folderName}/game${i+1}/${toCopy}`
            }
            promiseArray.push(
                s3makezipBucket.copyObject(param).promise()
            );
        }
        let bestOf = utils.returnBoolByPath(matchData.boX) ? matchData.boX : 3;
        if (i < bestOf) {
            buffer = Buffer.from("pulled a sneaky on you", "utf-8");
            let data = {
                Key: `${folderName}/game${i+1}/sneak.txt`,
                Body: buffer
            };
            promiseArray.push(
                s3makezipBucket.putObject(data).promise()
            );
        }

        //resolve the writes to the makezip bucket...
        Promise.all(promiseArray).then(
            function(success) {
                if (success) {

                    //now that we've create the directory to zip for this match, lets zip and send to client
                    //get a list of files in this bucket/folder
                    s3makezipBucket.listObjects({
                        Prefix: folderName
                    }).promise().then(
                        list => {
                            //loop through the list of files in this bucket/folder and create the array of files we need for the zip library
                            let archiveFiles = [];
                            let filesList = [];
                            list.Contents.forEach(
                                content => {
                                    let tO = {};
                                    tO.name = content.Key;
                                    archiveFiles.push(tO);
                                    filesList.push(content.Key);
                                }
                            )
                            res.writeHead(200, {
                                'Content-Type': 'application/zip'
                            });

                            //zip and return to client; the response is sent here.
                            s3Zip
                                .archive({
                                    region: process.env.S3region,
                                    bucket: process.env.s3bucketMakeZip
                                }, '', filesList, archiveFiles)
                                .pipe(res);

                            //now that we've sent the zip to the client nuke this out of S3
                            s3makezipBucket.listObjects({
                                Prefix: folderName
                            }).promise().then(
                                list => {
                                    let params = {
                                        Delete: {
                                            Objects: []
                                        }
                                    };
                                    list.Contents.forEach(
                                        content => {
                                            params.Delete.Objects.push({
                                                Key: content.Key
                                            });
                                        }
                                    );
                                    s3makezipBucket.deleteObjects(params).promise().then(
                                        success => {
                                            console.log(req.originalUrl, ' delete s3 zip directory for match ', matchData.matchId);
                                        },
                                        err => {
                                            console.log(req.originalUrl, ' delete FAIL ', matchData.matchId);
                                        }
                                    )
                                }
                            )

                        },
                        err => {
                            console.log(req.originalUrl, ' s3makezipBucket err ', err);
                        }
                    )
                }
            }
        ).catch(function(err) {
            console.log(req.originalUrl, ' copy err ', err);
        });

    } catch (e) {
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'Error Zipping', err))
    }
});

module.exports = router;


function returnIsCapt(foundTeams, requester) {
    let isCapt = false;
    foundTeams.forEach(team => {
        if (team.captain == requester) {
            isCapt = true;
        }
    });
    if (!isCapt) {
        if (foundTeams[0].assistantCaptain) {
            isCapt = foundTeams[0].assistantCaptain.indexOf(requester) > -1;
        }
    }
    if (!isCapt) {
        if (foundTeams[1].assistantCaptain) {
            isCapt = foundTeams[1].assistantCaptain.indexOf(requester) > -1;
        }
    }
    return isCapt;
}

function findTeamIds(found) {
    let teams = [];

    //type checking make sure we have array
    if (!Array.isArray(found)) {
        found = [found];
    }

    found.forEach(match => {
        if (utils.returnBoolByPath(match, 'home.id')) {
            if (match.home.id != 'null' && teams.indexOf(match.home.id.toString()) == -1) {
                teams.push(match.home.id.toString());
            }
        }
        if (utils.returnBoolByPath(match, 'away.id')) {
            if (match.away.id != 'null' && teams.indexOf(match.away.id.toString()) == -1) {
                teams.push(match.away.id.toString());
            }
        }
    });

    return teams;
}

async function addTeamNamesToMatch_foundOnly(found) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }

    let teams = findTeamIds(found);

    let teamInfo = await Team.find({
        _id: {
            $in: teams
        }
    }).then((foundTeams) => {
        if (foundTeams) {
            return foundTeams;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
    if (teamInfo) {
        teamInfo.forEach(team => {
            let teamid = team._id.toString();
            found.forEach(match => {
                let homeid, awayid;
                if (utils.returnBoolByPath(match, 'home.id')) {
                    homeid = match.home.id.toString();
                }
                if (utils.returnBoolByPath(match, 'away.id')) {
                    awayid = match.away.id.toString();
                }
                if (teamid == homeid) {

                    match.home['teamName'] = team.teamName;
                    match.home['logo'] = team.logo;
                    match.home['teamName_lower'] = team.teamName_lower;
                    match.home['ticker'] = team.ticker;
                }
                if (teamid == awayid) {

                    match.away['teamName'] = team.teamName;
                    match.away['logo'] = team.logo;
                    match.away['teamName_lower'] = team.teamName_lower;
                    match.away['ticker'] = team.ticker;
                }
            });
        });
    }

    return found

};

async function addTeamNamesToMatch(teams, found) {
    //typechecking
    if (!Array.isArray(found)) {
        found = [found];
    }

    return Team.find({ _id: { $in: teams } }).then((foundTeams) => {
        if (foundTeams) {

            foundTeams.forEach(team => {
                let teamid = team._id.toString();
                found.forEach(match => {
                    let homeid, awayid;
                    if (utils.returnBoolByPath(match, 'home.id')) {
                        homeid = match.home.id.toString();
                    }
                    if (utils.returnBoolByPath(match, 'away.id')) {
                        awayid = match.away.id.toString();
                    }
                    if (teamid == homeid) {
                        match.home['teamName'] = team.teamName;
                        match.home['logo'] = team.logo;
                        match.home['teamName_lower'] = team.teamName_lower;
                        match.home['ticker'] = team.ticker;
                    }
                    if (teamid == awayid) {
                        match.away['teamName'] = team.teamName;
                        match.away['logo'] = team.logo;
                        match.away['teamName_lower'] = team.teamName_lower;
                        match.away['ticker'] = team.ticker;
                    }
                });
            });
            return found;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
};

function findDivs(found) {
    let divs = [];

    //type checking make sure we have array
    if (!Array.isArray(found)) {
        found = [found];
    }

    found.forEach(match => {
        if (divs.indexOf(match.divisionConcat) == -1) {
            divs.push(match.divisionConcat);
        }
    });

    return divs;
}

async function addTeamAndDivsionNames(found) {
    let divs = await getDivisionNames(found);
    let completed = await addTeamNamesToMatch_foundOnly(found).then(
        nameProcess => {
            nameProcess.forEach(match => {
                divs.forEach(div => {
                    if (match.divisionConcat == div.divisionConcat) {
                        match.divisionDisplayName = div.displayName;
                    }
                });
            });
            return nameProcess;
        },
        err => {
            return err;
        }
    );

    return completed;
}

async function getDivisionNames(found) {
    let div = findDivs(found);
    let divInfo = await Division.find({ divisionConcat: { $in: div } }).lean().then(
        found => { return found; },
        err => { return null; }
    );
    return divInfo;
}

function queryScheduling(query) {
    return Scheduling.find(query).then(
        (found) => {
            return found;
        },
        (err) => {
            throw err;
        },
    );
}

function returnFullMatchInfo(queryObj, pastSeason, season) {
    return Match.find(queryObj).lean().then(
        (found) => {
            if (pastSeason) {
                return matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
                    processed => {
                        return processed
                    },
                    err => {
                        throw err;
                    })
            } else {
                return matchCommon.addTeamInfoToMatch(found).then(
                    processed => {
                        return processed;
                    },
                    err => {
                        throw err;
                    })
            }
        },
        (err) => {
            throw err;
        }
    )
}

function associateTournamentsAndMatches(matches, returnArray) {
    _.forEach(matches, (match) => {
        match = utils.objectify(match);

        let tournObj = _.find(returnArray, function(ele) {
            if (ele.challonge_ref == match.challonge_tournament_ref) {
                return ele;
            }
        });

        if (tournObj) {
            if (utils.returnBoolByPath(tournObj, 'teamMatches')) {
                tournObj['teamMatches'].push(match);
            } else {
                tournObj['teamMatches'] = [match];
            }
        }
    });
}

function parseTournamentReturnObjects(tournaments, returnArray, tournamentIdsArray) {
    _.forEach(tournaments, (tournament) => {
        tournament = utils.objectify(tournament);
        tournamentIdsArray.push(tournament.challonge_ref);
        let returnObject = {};
        returnObject['tournamentName'] = tournament.name;
        returnObject['challonge_url'] = tournament.challonge_url;
        returnObject['challonge_ref'] = tournament.challonge_ref;
        returnObject['active'] = tournament.active;
        returnArray.push(returnObject);
    });
}


// let season = requiredParameters.season.value;

// let query = {
//     $and: [{
//             season: season
//         },
//         {
//             reported: true
//         }
//     ]
// }

// let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
// let pastSeason = season != currentSeasonInfo.value;

// if (optionalParameters.division.valid) {
//     query.$and.push({
//         divisionConcat: optionalParameters.division.value
//     });
// }

// return Match.find(query).lean().then(
//     found => {
//         if (found) {
//             if (optionalParameters.sortOrder.value == 'des') {
//                 found = utils.sortMatchesByTime(found);
//                 found.reverse();
//             } else if (optionalParameters.sortOrder.value == 'asc') {
//                 found = utils.sortMatchesByTime(found);
//             }

//             if (optionalParameters.limit.valid) {
//                 let limit = optionalParameters.limit.value > found.length ? found.length : optionalParameters.limit.value;
//                 found = found.slice(0, limit);
//             }

//             if (pastSeason) {
//                 return matchCommon.addTeamInfoFromArchiveToMatch(found, season).then(
//                     processed => {
//                         response.status = 200;
//                         response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed)
//                         return response;
//                     },
//                     err => {
//                         response.status = 400
//                         response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
//                         return response;
//                     }
//                 )
//             } else {
//                 return matchCommon.addTeamInfoToMatch(found).then(
//                     processed => {
//                         response.status = 200;
//                         response.message = utils.returnMessaging(req.originalUrl, 'Found these matches', null, processed)
//                         return response;
//                     },
//                     err => {
//                         response.status = 400;
//                         response.message = utils.returnMessaging(req.originalUrl, 'Error compiling match info', err)
//                         return response;
//                     }
//                 )
//             }
//         } else {
//             response.status = 200;
//             response.message = utils.returnMessaging(req.originalUrl, 'No Matches Found', null, found)
//             return response;
//         }
//     }, err => {
//         response.status = 500;
//         response.message = utils.returnMessaging(req.originalUrl, 'Error getting matches', err)
//         return response;
//     }
// );