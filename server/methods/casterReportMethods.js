const CasterReport = require('../models/caster-report-models');
const Match = require('../models/match-model');
const User = require('../models/user-models');
const utils = require('../utils');

async function upsertCasterReport(obj) {

    try {

        let accountByName = [];
        accountByName.push(obj.casterName);
        obj.coCasters.forEach((u) => {
            accountByName.push(u);
        });

        let users = await User.find({ displayName: { $in: accountByName } }).then(
            users => {
                return users;
            },
            err => {
                throw err;
            }
        )

        console.log(users);

        let xref = [];
        if (users) {

            let t = {};
            accountByName.forEach((u) => {
                users.forEach(us => {
                    us = utils.objectify(us);
                    if (u === us.displayName) {
                        t.displayName = u;
                        t.id = us._id;
                        xref.push(t);
                    }
                })
            });

            Match.findOne({ matchId: obj.matchId }).then(
                foundMatch => {
                    foundMatch.vodLinks = obj.vodLinks;
                    foundMatch.markModified('vodLinks');
                    foundMatch.save();
                });

            // replace displaynames with ids
            obj.casterId = findId(obj.casterName, xref);
            obj.coCasterIds = [];
            obj.coCasters.forEach(u => {
                obj.coCasterIds.push(findId(u, xref));
            });

            let saved = await CasterReport.CasterReport.findOneAndUpdate({
                matchId: obj.matchId
            }, obj, {
                new: true,
                upsert: true
            }).then(
                newItem => {
                    return newItem;
                },
                err => {
                    throw err;
                }
            );

            return saved;

        } else {
            throw new Error('Error saving caster report.');
        }

    } catch (e) {
        console.log(e);
        throw e;
    }

}

function findId(display, xref) {
    let id = '';
    xref.forEach(i => {
        if (i.displayName == display) {
            id = i.id;
        }
    });
    return id;
}


async function getCasterReport(id) {
    console.log('iddddd', id);
    return CasterReport.CasterReport.findOne({ matchId: id }).then(
        found => {
            console.log('found', found);
            return found;
        },
        err => {
            throw err;
        }
    )
}


module.exports = {
    upsertCasterReport: upsertCasterReport,
    getCasterReport: getCasterReport
}