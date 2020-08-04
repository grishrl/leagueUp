const {
    confirmCaptain
} = require("../methods/confirmCaptain");
const notesMethods = require('../methods/notes/notes');
const util = require('../utils');
const router = require('express').Router();
const passport = require("passport");
const levelRestrict = require("../configs/admin-leveling");

// router.get('notes/fetch/team', passport.authenticate('jwt', {
//     session: false
// }), levelRestrict.teamLevel, (req, res) => {

//     const path = 'admin/notes/fetch/team';
//     notesMethods.getNotes(req.query.subjectId).then(
//         found => {
//             res.status(200).send(
//                 util.returnMessaging(path, 'Found notes.', false, found)
//             );
//         },
//         err => {
//             res.status(500).send {
//                 util.returnMessaging(path, 'Error getting notes.', err);
//             }
//         }
//     )
// });

router.get('/notes/fetch/user', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, (req, res) => {

    const path = 'admin/notes/fetch/user';
    notesMethods.getNotes(req.query.subjectId).then(
        found => {
            res.status(200).send(
                util.returnMessaging(path, 'Found notes.', false, found)
            );
        },
        err => {
            res.status(500).send(
                util.returnMessaging(path, 'Error getting notes.', err)
            );
        }
    )
});

router.post('/notes/create/user', passport.authenticate('jwt', {
    session: false
}), levelRestrict.userLevel, (req, res) => {

    const path = 'admin/notes/create/user';

    notesMethods.createNote(req.body).then(
        created => {
            res.status(200).send(
                util.returnMessaging(path, 'Note created', false, created)
            );
        },
        err => {
            res.status(500).send(
                util.returnMessaging(path, 'Error creating notes.', err)
            );
        }
    )
});

// router.post('notes/create/team', passport.authenticate('jwt', {
//     session: false
// }), levelRestrict.teamLevel, (req, res) => {

//     const path = 'admin/notes/create/team';

//     notesMethods.createNote(req.body).then(
//         created => {
//             res.status(200).send(
//                 util.returnMessaging(path, 'Note created', false, created)
//             );
//         },
//         err => {
//             res.status(500).send {
//                 util.returnMessaging(path, 'Error creating notes.', err);
//             }
//         }
//     )
// });

router.post('/notes/delete',
    passport.authenticate('jwt', {
        session: false
    }), levelRestrict.teamLevel, (req, res) => {

        const path = 'admin/notes/delete';

        notesMethods.deleteNote(req.body.noteId).then(
            created => {
                res.status(200).send(
                    util.returnMessaging(path, 'Note deleted', false, created)
                );
            },
            err => {
                res.status(500).send(
                    util.returnMessaging(path, 'Error deleting note.', err)
                );
            }
        )
    });

module.exports = router;