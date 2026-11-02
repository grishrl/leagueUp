const ParsedReplay = require('../../models/replay-parsed-models');
const parser = require('hots-parser');
const logger = require('../../subroutines/sys-logging-subs').logger;
const Match = require('../../models/match-model');
const Team = require('../../models/team-models');
const matchCommon = require('../matchCommon');
const util = require('../../utils');
const AWS = require('aws-sdk');
const uniqid = require('uniqid');
const _ = require('lodash');
const { s3deleteFile } = require('../aws-s3/delete-s3-file');
const SeasonInfoCommon = require('../seasonInfoMethods');
const utils = require('../../utils');
const {s3putObject} = require("../aws-s3/put-s3-file");

const ngsStatsOfTheStorm = process.env.s3bucketStats; //'ngs-stats-of-the-storm';

async function reportMatch(caller, matchReport, requester, bypass) {
    let logObj = {};
    logObj.actor = requester;
    logObj.action = 'report match';
    logObj.logLevel = 'STD';
    logObj.location = caller;
    logObj.target = matchReport.matchId;

    let match = await Match.findOne({
        matchId: matchReport.matchId,
    });

    let errToThrow = '';

    if (!match) {
        //fail match not found
        errToThrow = 'Error reporting match result';
        logObj.logLevel = 'ERROR';
        logger(logObj);
        throw errToThrow;
    } else {
        let teamIds = matchCommon.findTeamIds([match.toObject()]);

        let foundTeams = await Team.find({
            _id: {
                $in: teamIds,
            },
        });

        let homeDominate = false;
        let awayDominate = false;
        if (
            util.returnBoolByPath(matchReport, 'homeTeamScore') &&
            util.returnBoolByPath(matchReport, 'awayTeamScore')
        ) {
            if (
                matchReport.homeTeamScore == 2 &&
                matchReport.awayTeamScore == 0
            ) {
                homeDominate = true;
            } else if (
                matchReport.homeTeamScore == 0 &&
                matchReport.awayTeamScore == 2
            ) {
                awayDominate = true;
            }
        }

        teamInfo = [];
        foundTeams.forEach(team => {
            let teamid = team._id.toString();
            let homeid, awayid;
            if (util.returnBoolByPath(match.toObject(), 'home.id')) {
                homeid = match.home.id.toString();
            }
            if (util.returnBoolByPath(match.toObject(), 'away.id')) {
                awayid = match.away.id.toString();
            }
            if (teamid == homeid) {
                if (homeDominate) {
                    match.home.dominator = true;
                }
                match.home.teamName = team.teamName;
                if (util.returnBoolByPath(matchReport, 'homeTeamScore')) {
                    match.home.score = matchReport.homeTeamScore;
                }
            }
            if (teamid == awayid) {
                if (awayDominate) {
                    match.away.dominator = true;
                }
                match.away.teamName = team.teamName;
                if (util.returnBoolByPath(matchReport, 'awayTeamScore')) {
                    match.away.score = matchReport.awayTeamScore;
                }
            }
            //info object
            let teamInf = {};
            //teamname
            teamInf['teamName'] = team.teamName;
            teamInf['id'] = teamid;
            //add all the players of the team into a player array
            teamInf['players'] = [];
            team.teamMembers.forEach(member => {
                let name = member.displayName.split('#');
                name = name[0];
                teamInf['players'].push(name);
            });
            teamInfo.push(teamInf);
        });

        if (
            matchReport.otherDetails != null &&
            matchReport.otherDetails != undefined
        ) {
            let keys = Object.keys(matchReport.otherDetails);
            for (var i = 0; i < keys.length; i++) {
                if (!util.returnBoolByPath(util.objectify(match), 'other')) {
                    match.other = {};
                }
                let key = keys[i];
                let val = matchReport.otherDetails[key];
                match.other[key] = val;
                match.markModified('other');
            }
        }

        if (matchReport.mapBans != null && matchReport.mapBans != undefined) {
            match.mapBans = matchReport.mapBans;
        }

        let keysArray = Object.keys(matchReport.fileTracking);
        for (var i = 0; i < keysArray.length; i++) {
            let key = keysArray[i];
            let v = matchReport.fileTracking[key];

            if (match.replays == undefined || match.replays == null) {
                match.replays = {};
            }
            if (
                match.replays[key.toString()] == undefined ||
                match.replays[key.toString()] == null
            ) {
                match.replays[key.toString()] = {};
            }
            match.replays[key].tempUrl = v['filename'];
        }

        //validate the submitter is a captain OR assistantCaptain of one of the teams
        let isCapt = bypass ? bypass : returnIsCapt(foundTeams, requester);
        if (!isCapt) {
            //fail request is not authorized to report
            errToThrow = 'Unauthorized';
            logObj.logLevel = 'ERROR';
            logObj.error = 'Unauthorized to report';
            throw errToThrow;
        } else {
            match.reported = true;
            match.postedToHP = false;
            return match.save(
                saved => {
                    //if this match was a tournmanet match then we need to promote the winner to the parent match
                    matchCommon.promoteTournamentMatch(match.toObject());
                    moveAndParseTempFiles(match.matchId);
                    return { msg: 'Match reported', obj: saved };
                },
                err => {
                    errToThrow = 'Error reporting match result';
                    logObj.logLevel = 'ERROR';
                    logObj.error = JSON.stringify(err);
                    logger(logObj);
                    throw errToThrow;
                }
            );
        }
    }
}

module.exports = reportMatch;

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

const fileExtension = '.stormReplay';

async function moveAndParseTempFiles(matchId) {
    let logObj = {};
    logObj.actor = 'SYS';
    logObj.action = 'report match post-processing';
    logObj.logLevel = 'STD';
    logObj.location = 'moveAndParseTempFiles';
    logObj.target = matchId;



    try {
        let match = await Match.findOne({
            matchId: matchId,
        });
        if (!match) {
            //fail match not found
            errToThrow = 'Error reporting match result';
            logObj.logLevel = 'ERROR';
            logger(logObj);
            throw errToThrow;
        } else {
            let teamIds = matchCommon.findTeamIds([match.toObject()]);

            let foundTeams = await Team.find({
                _id: {
                    $in: teamIds,
                },
            });

            if (!foundTeams) {
                //fail teams not found
                errToThrow = 'Error reporting match result';
                logObj.logLevel = 'ERROR';
                logger(logObj);
                throw errToThrow;
            } else {
                //an array of team name and players on each team, used to associate the replays to the specifc team
                teamInfo = [];
                foundTeams.forEach(team => {

                    let teamid = team._id.toString();

                    let homeid, awayid;

                    if (util.returnBoolByPath(match.toObject(), 'home.id')) {
                        homeid = match.home.id.toString();
                    }
                    if (util.returnBoolByPath(match.toObject(), 'away.id')) {
                        awayid = match.away.id.toString();
                    }

                    //info object
                    let teamInf = {};
                    //teamname
                    teamInf['teamName'] = team.teamName;
                    teamInf['id'] = teamid;
                    //add all the players of the team into a player array
                    teamInf['players'] = [];

                    team.teamMembers.forEach(member => {
                        let name = member.displayName.split('#');
                        name = name[0];
                        teamInf['players'].push(name);
                    });

                    teamInfo.push(teamInf);
                });

                let matchObj = util.objectify(match);

                let replays = matchObj.replays;

                //parse the replays
                let parsed = [];

                AWS.config.update({
                    accessKeyId: process.env.S3accessKeyId,
                    secretAccessKey: process.env.S3secretAccessKey,
                    region: process.env.S3region,
                });

                const s3pendingFiles = new AWS.S3({
                    params: {
                        Bucket: 's3-client-uploads',
                    },
                });

                const tmp = require('tmp-promise');
                const fs = require('fs');

                let keysArray = Object.keys(replays);
                for (var i = 0; i < keysArray.length; i++) {
                    let key = keysArray[i];
                    let value = matchObj.replays[key];

                    if (util.returnBoolByPath(value, 'tempUrl')) {
                        let dat = await s3pendingFiles
                            .getObject({
                                Key: value['tempUrl'],
                            })
                            .promise()
                            .then(
                                dat => {
                                    return dat;
                                },
                                err => {
                                    return null;
                                }
                            );

                        /**
                         * parsed
                         * {
                         *     match:num,
                         *     parseObj: json parsed object,
                         *     tempFileName: tempUrl from s3,
                         *     parsedReplayId: uuid for replay name,
                         *
                         * }
                         */

                        if (dat) {
                            try {
                                const { fd, path, cleanup } = await tmp.file();
                                let f = await fs.promises.appendFile(
                                    path,
                                    dat.Body
                                );
                                let parsedReplay = parser.processReplay(path, {
                                    overrideVerifiedBuild: true,
                                });

                                if (parsedReplay.status != 1) {
                                    parsedReplay['failed'] = true;
                                }
                                parsed.push({
                                    matchNum: key,
                                    parseObj: parsedReplay,
                                    tempFileName: value['tempUrl'],
                                });
                                cleanup();
                            } catch (error) {
                                parsed.push({
                                    matchNum: key,
                                    parseObj: { failed: true },
                                    tempFileName: value['tempUrl'],
                                });
                                util.errLogger(
                                    'moveAndParseTempFiles, parsing:',
                                    error,
                                    'caught parse error'
                                );
                            }
                        } else {
                            //no dat!!!
                        }
                    }
                }
                //build new file name from parse info and give parsed replays some UUIDs
                parsed.forEach((element, index) => {
                    let tieBack = {};
                    let timeStamp = '';
                    if (
                        util.returnBoolByPath(
                            match.toObject(),
                            'scheduledTime.startTime'
                        )
                    ) {
                        let date = new Date(
                            parseInt(match.scheduledTime.startTime)
                        );
                        let day = date.getDate();
                        let year = date.getFullYear();
                        let month = date.getMonth();
                        month = month + 1;
                        timeStamp = month + '-' + day + '-' + year;
                    }

                    let composeFilename = `ngs_${timeStamp}_${teamInfo[0].teamName}_vs_${teamInfo[1].teamName}`;

                    //if the replay does not parse we will still store in the s3 giving it an unknown_map suffix
                    if (
                        element.parseObj &&
                        element.parseObj.hasOwnProperty('failed') &&
                        element.parseObj.failed == true
                    ) {
                        composeFilename += `_unknown_map-${index}`;
                    } else {
                        let UUID = uniqid();
                        tieBack.id = UUID;
                        //this object will be pushed into the replayfilenames hold some info we need to save back to the match to tie the two together
                        let replayTeamA = element.parseObj.match.teams['0'];
                        let replayTeamB = element.parseObj.match.teams['1'];

                        //sort through the team members in the replay to assign the proper team names into the parsed replay object
                        teamInfo.forEach(teamInfo => {
                            if (
                                _.intersection(
                                    replayTeamA.names,
                                    teamInfo.players
                                ).length >
                                _.intersection(
                                    replayTeamB.names,
                                    teamInfo.players
                                ).length
                            ) {
                                replayTeamA.teamName = teamInfo.teamName;
                                replayTeamA.teamId = teamInfo.id;
                            } else if (
                                _.intersection(
                                    replayTeamA.names,
                                    teamInfo.players
                                ).length <
                                _.intersection(
                                    replayTeamB.names,
                                    teamInfo.players
                                ).length
                            ) {
                                replayTeamB.teamName = teamInfo.teamName;
                                replayTeamB.teamId = teamInfo.id;
                            } else {
                                //some error state, both == 0....
                            }
                        });

                        element.parsedReplayId = UUID;
                        composeFilename += `_${element.parseObj.match.map}`;
                        // element.parseObj.match['ngsMatchId'] = match.matchId;
                        composeFilename = composeFilename.replace(
                            /[^A-Z0-9\-]+/gi,
                            '_'
                        );
                        // element.parseObj.match.filename = composeFilename;
                        element.parseObj.systemId = UUID;
                    }
                    element.newFileName = `${composeFilename}${fileExtension}`;
                });

                //MOVE REPLAY FILES FROM TEMP TO FINAL RESTING
                for (var i = 0; i < keysArray.length; i++) {
                    let key = keysArray[i];
                    let obj;

                    parsed.forEach(e => {
                        if (e.matchNum == key) {
                            obj = e;
                        }
                    });

                    if (
                        matchObj.replays == undefined ||
                        matchObj.replays == null
                    ) {
                        matchObj.replays = {};
                    }
                    if (
                        matchObj.replays[key.toString()] == undefined ||
                        matchObj.replays[key.toString()] == null
                    ) {
                        matchObj.replays[key.toString()] = {};
                    }

                    if (obj) {
                        if (obj.parsedReplayId) {
                            matchObj.replays[key.toString()].data =
                                obj.parsedReplayId;
                        }

                        if (obj.tempFileName) {
                            const copyParam = {
                                CopySource: `s3-client-uploads/${obj.tempFileName}`,
                                Bucket: process.env.s3bucketReplays,
                                Key: obj.newFileName,
                            };
                            let copied = await s3pendingFiles
                                .copyObject(copyParam)
                                .promise()
                                .then(
                                    res => {
                                        return res;
                                    },
                                    err => {
                                        return null;
                                    }
                                );
                            if (copied) {
                                matchObj.replays[key.toString()].url =
                                    obj.newFileName;
                                delete matchObj.replays[key.toString()].tempUrl;
                                s3deleteFile(
                                    's3-client-uploads',
                                    null,
                                    obj.tempFileName
                                );
                            } else {
                                //uh oh
                                let fileLog = {};
                                fileLog.actor = 'SYS';
                                fileLog.action = 'remove s3 file';
                                fileLog.logLevel = 'ERROR';
                                fileLog.location = 'moveAndParseTempFiles';
                                fileLog.target = obj.tempFileName;
                                logger(fileLog);
                                util.errLogger(
                                    'moveAndParseTempFiles',
                                    `${obj.tempFileName} file wasnt moved!`
                                );
                            }
                        }
                    }
                }

                _.forEach(matchObj.replays, (v, k) => {
                    match.replays[k] = v;
                });

                //if we have failed parse - remove those junk objects from the array before inserting them into the database.
                indiciesToRemove = [];
                let season = await SeasonInfoCommon.getSeasonInfo();
                const seasonNum = season.value;

                //reset index to only the parsed obj data
                parsed.forEach((element, index) => {
                    parsed[index] = element.parseObj;
                });

                parsed.forEach((element, index) => {
                    // element.season = seasonNum;
                    if (
                        element.hasOwnProperty('failed') &&
                        element.failed == true
                    ) {
                        indiciesToRemove.push(index);
                    }
                });

                indiciesToRemove.forEach(index => {
                    parsed.splice(index, 1);
                });

                
                parsed.forEach(
                    parsedItem=>{
                        s3putObject(
                            ngsStatsOfTheStorm,
                            `${seasonNum}/parsedReplays`,
                            `${parsedItem.systemId}.json`,
                            JSON.stringify(parsedItem)
                        );
                        let map = parsedItem.match.map;
                        parsedItem.match = {map};
                        parsedItem.players = {};
                        parsedItem.season = seasonNum;
                    }
                );

                //putting
                ParsedReplay.collection.insertMany(parsed).then(
                    records => {
                        let sysLog = {};
                        sysLog.actor = 'SYS';
                        sysLog.action = ' parsed replay stored';
                        sysLog.logLevel = 'SYSTEM';
                        sysLog.target = '';
                        sysLog.timeStamp = new Date().getTime();
                        logger(sysLog);
                    },
                    err => {
                        let sysLog = {};
                        sysLog.actor = 'SYS';
                        sysLog.action = ' parsed replay error';
                        sysLog.logLevel = 'ERROR';
                        sysLog.error = err;
                        sysLog.target = '';
                        sysLog.timeStamp = new Date().getTime();
                        logger(sysLog);
                    }
                );

                match.markModified('replays');

                match.save().then(
                    saved => {
                        logObj.action += ': FINISHED OK';
                        logger(logObj);
                    },
                    err => {
                        logObj.logLevel = 'ERROR';
                        logObj.err = JSON.stringify(err);
                        logger(logObj);
                    }
                );
            }
        }
    } catch (e) {
        util.errLogger('moveAndParseTempFiles', e, 'Caught');
    }
}
/*
 //these replays are in s3 all ready!

                
*/
