const util = require('../utils');
const router = require('express').Router();
const Archive = require('../models/system-models').archive;
const Schedule = require('../models/schedule-models');
const axios = require('axios');

router.get('/seasons', (req, res) => {

    const path = '/history/seasons';
    let query = {
        type: { $exists: false }
    }
    Schedule.find(query).then(
        found => {
            res.status(200).send(util.returnMessaging(path, 'Found seasons:', false, found));
        },
        err => {
            res.status(500).send(util.returnMessaging(path, 'Error finding seasons:', err));
        }
    );
});

router.get('/season/divisions', (req, res) => {

    const path = '/history/season/divisions';

    let season = req.query.season;
    if (season) {
        let query = {
            season: season,
            type: 'division'
        };
        Archive.find(query).then(
            found => {
                res.status(200).send(util.returnMessaging(path, 'Found divisions for season ' + season + ':', false, found));
            },
            err => {
                res.status(500).send(util.returnMessaging(path, 'Error finding divisions:', err));
            }
        );
    } else {
        res.status(400).send(util.returnMessaging(path, 'Season not provided'));
    }

});

router.get('/season/division', (req, res) => {

    const path = '/history/season/division';

    let season = req.query.season;
    let division = req.query.division;
    if (season && division) {
        let query = {
            season: season,
            type: 'division'
        };
        Archive.find(query).then(
            found => {
                res.status(200).send(util.returnMessaging(path, 'Found division for season ' + season + ':', false, found));
            },
            err => {
                res.status(500).send(util.returnMessaging(path, 'Error finding division:', err));
            }
        );
    } else {
        res.status(400).send(util.returnMessaging(path, 'Parameters not provided See required params:', { 'season': season, 'division': division }));
    }

});

module.exports = router;