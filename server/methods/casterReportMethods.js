const CasterReport = require('../models/caster-report-models');
const Match = require('../models/match-model');
const User = require('../models/user-models');
const Team = require('../models/team-models');
const utils = require('../utils');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const fs = require('fs');
const uncasted = require('./uncasted');
const getMatches = require('./matches/getMatchesBy');
const getRegisteredTeams = require('./team/getRegistered');
const _ = require('lodash');

async function upsertCasterReport(obj) {

    if (Array.isArray(obj)) {
        let ret = [];
        for (var i = 0; i < obj.length; i++) {
            let r = await handleCasterReportObj(obj[i]);
            ret.push(r);
        }
        return ret;
    } else {
        return handleCasterReportObj(obj);
    }

}

async function handleCasterReportObj(obj) {
    try {
        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();

        let accountById = [];
        accountById.push(obj.casterId);

        obj.coCasterIds = utils.isNullOrEmpty(obj.coCasterIds) ?  [] : obj.coCasterIds;
        
        obj.coCasterIds.forEach((u) => {
            accountById.push(u);
        });

        //get user data by ids... fresh copy from db
        let usersByIdFromDb = await User.find({ _id: { $in: accountById } }).then(
            users => {
                return users;
            },
            err => {
                throw err;
            }
        )
        
        //need to get account IDs by display names..
        let accountNames = [];
        accountNames.push(obj.casterName);

        obj.coCasters = utils.isNullOrEmpty(obj.coCasters) ? [] : obj.coCasters;

        obj.coCasters.forEach( coCasterName=>{
            accountNames.push(coCasterName);
        });

        let usersByNameFromDb = await User.find({displayName:{$in:accountNames}}).then(
            users => {
                return users;
            },
            err => {
                throw err;
            }
        );

        let totalUsers = [];
        
        usersByIdFromDb.forEach(u=>{
            let tObj = utils.objectify(u);
            if(_.findIndex(totalUsers, {_id:tObj._id})==-1){
                totalUsers.push(tObj);
            }
        });
        usersByNameFromDb.forEach(u=>{
            let tObj = utils.objectify(u);
            if(_.findIndex(totalUsers, {_id:tObj._id})==-1){
                totalUsers.push(tObj);
            }
        });

        let xref = [];
        if (totalUsers.length > 0) {


            Match.findOne({ matchId: obj.matchId }).then(
                foundMatch => {
                    foundMatch.vodLinks = obj.vodLinks;
                    foundMatch.markModified('vodLinks');
                    foundMatch.save();
                });

            // replace displaynames with ids
            obj.casterId =  _.find(totalUsers, {displayName:obj.casterName})._id;
            obj.coCasterIds = [];
            obj.coCasters.forEach(u => {
                obj.coCasterIds.push(_.find(totalUsers, {displayName:u})._id);
            });

            obj.season = currentSeasonInfo.value;

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
            console.log('We had something fishy...');
            obj.error = "casterReportMethods, 116";
            
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
        }
        

    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function getUnCurratedReports() {

    // const query = { $or : [ { "playlistCurrated" : null }, { "playlistCurrated" : { $exists : false } } ] };
    const query = { "playlistCurrated" : { $ne : true } };

    return CasterReport.CasterReport.find(query).then(
        found => {
            return found;
        },
        err => {
            throw err;
        }
    )
}

async function getCasterReport(id) {
    return CasterReport.CasterReport.findOne({ matchId: id }).then(
        found => {

            return found;
        },
        err => {
            throw err;
        }
    )
}

async function generateCastReportData() {

    const currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
    const season = currentSeasonInfo.value;
    const reportedMatches = await getMatches.returnReportedMatches(season);
    const teamData = await getRegisteredTeams();

    const report = uncasted(teamData, reportedMatches);
    const casterReports = await CasterReport.CasterReport.find({ season: season });


    const casterData = reportByCasters(casterReports);

    const casterIds = Object.keys(casterData);

    const CastersInfo = await User.find({ _id: { $in: casterIds } });

    // console.log('CastersInfo', CastersInfo);
    const reportByCastersInfo = [];

    _.forEach(casterData, (v, k) => {
        // console.log('v,k', v, k);
        CastersInfo.forEach(ci => {
            let id = ci._id.toString();
            // console.log('id', id, 'k', k, 'id === k', id === k)
            if (id === k) {
                v['btag'] = ci.displayName;
                v['castername'] = ci.casterName;
                reportByCastersInfo.push(v);
            }
        })
    });

    report['CasterTotals'] = reportByCastersInfo;

    // fs.writeFile('./reportTest.json', JSON.stringify(report), (e, s) => {
    //     if (e) {
    //         console.log('err writing', e);
    //     } else {
    //         console.log('success write', s);
    //     }
    // })

    return report;
}

module.exports = {
    upsertCasterReport: upsertCasterReport,
    getCasterReport: getCasterReport,
    generateCastReportData: generateCastReportData,
    getUnCurratedReports: getUnCurratedReports
}


function reportByCasters(reportData) {
    let reportObj = {};

    // console.log('reportData', reportData)

    for (var i = 0; i < reportData.length; i++) {
        var report = reportData[i];
        if (reportObj.hasOwnProperty(report.casterId)) {
            reportObj[report.casterId].castCount += 1;
        } else {
            reportObj[report.casterId] = {
                castCount: 1,
                coCastCount: 0
            }
        }
        report.coCasterIds.forEach(id => {
            if (reportObj.hasOwnProperty(id)) {
                reportObj[id].coCastCount += 1;
            } else {
                reportObj[id] = {
                    castCount: 0,
                    coCastCount: 1
                }
            }
        });
    }

    return reportObj;

}