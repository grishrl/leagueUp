const {
    confirmCaptain
} = require("../methods/confirmCaptain");
const notesMethods = require('../methods/notes/notes');
const utils = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");
const {
    commonResponseHandler
} = require('./../commonResponseHandler');


router.get('/notes/fetch/user', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, (req, res) => {

    const path = 'admin/notes/fetch/user';

    const requiredParameters = [{
        name: 'subjectId',
        type: 'string'
    }]

    commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
        const response = {};

        return notesMethods.getNotes(requiredParameters.subjectId.value).then(
            found => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Found notes.', false, found);
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error getting notes.', err);
                return response;
            }
        );
    })
});

router.post('/notes/create/user', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, (req, res) => {

    const path = 'admin/notes/create/user';

    commonResponseHandler(req, res, [], [], async(req, res) => {
        const response = {};
        return notesMethods.createNote(req.body).then(
            created => {
                response.status = 200;
                response.message = utils.returnMessaging(req.originalUrl, 'Note created', false, created);
                return response;
            },
            err => {
                response.status = 500;
                response.message = utils.returnMessaging(req.originalUrl, 'Error creating notes.', err);
                return response;
            }
        );
    });
});

router.post('/notes/delete',
    passport.authenticate('jwt', {
        session: false
    }), levelRestrict.teamLevel, (req, res) => {

        const path = 'admin/notes/delete';

        const requiredParameters = [{
            name: 'noteId',
            type: 'string'
        }]

        commonResponseHandler(req, res, requiredParameters, [], async(req, res, requiredParameters) => {
            const response = {};

            return notesMethods.deleteNote(requiredParameters.noteId.value).then(
                created => {
                    response.status = 200;
                    response.message = utils.returnMessaging(req.originalUrl, 'Note deleted', false, created);
                    return response;
                },
                err => {
                    response.status = 500;
                    response.message = utils.returnMessaging(req.originalUrl, 'Error deleting note.', err);
                    return response;
                }
            )

        });

    });

module.exports = router;