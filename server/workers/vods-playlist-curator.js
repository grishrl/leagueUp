const { google } = require('googleapis');
const SeasonInfoCommon = require('../methods/seasonInfoMethods');
const utils = require('../utils');
const Division = require('../models/division-models');
const CasterReportMethod = require('../methods/casterReportMethods');
const _ = require('lodash');
const logger = require('../subroutines/sys-logging-subs').logger;


const System = require('../models/system-models').system;

const gsapi = google.youtube("v3");

const UNCURRATED_AMOUNT = 50;

/**
 *   ready (sets up google authentication and gets needed data for currator) ->
 *   run  (kicks off recurse playlist) ->
 *   recursePlaylist ( calls the playlist info method recursively until all the info is grabbed ) ->
 *   parseList ( parses the playlist info from google inorder to check if playlists are created ) ->
 *   currateList ( loops through reports to upload vods, if the playlist exists will create an array of videos to upload
 *         if play list does not exist create an array of promises to create new playlist, the vods for the new playlist
 *         go into a deferred insert array that is cleaned up after the playlist is created ) ->
 *    
 * helpers: 
 *  createPlaylist -> creates an array of promises to create new playlists
 *  insertVidToList -> creates an array of request objects for playlist inserts to google
 *  insertVideos -> iterates the array or requests and inserts videos to youtube
 *  
 */

//ngs channel id : UCnfohSTrlMyqiCwI5-3jXmw
//ngs web channel id : UCOf6CO75ePUy5Q5lCthv2Jg
const CHANNELID = process.env.youtube_channel_id;


function PlaylistCurator() {

    var curator = {
        deferredInserts: [],
        createPlaylistArr: [],
        matchResultsArr: [],
        playlistaddarr: [],
        reports: [],
        playlistAdded: 0,
        playlistList: [],
        parsedList: [],
        errorCount: 0,
    };

    /**
     * Ready the playlist currator for work...
     */
    curator.ready = async function() {

        let currentSeasonInfo = await SeasonInfoCommon.getSeasonInfo();
        this.seasonValue = currentSeasonInfo.value;

        let DivisionInfo = await getDivisionInfo();

        this.divisionInfo = DivisionInfo;

        let UnCurrated = await getUncrrated();
        this.reports = UnCurrated;

        var OAuth2Client = google.auth.OAuth2;
        var CLIENT_ID = process.env.youtube_oauth;
        var CLIENT_SECRET = process.env.youtube_secret;
        var REDIRECT_URL = 'https://developers.google.com/oauthplayground';
        var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

        var credentials = {}
        credentials['refresh_token'] = process.env.youtube_refresh_token;
        oauth2Client.setCredentials(credentials);

        return oauth2Client.getAccessToken().then(
            r => {
                console.log('token ready');
                google.options({ auth: oauth2Client });
                // gsapi.options({ auth: oauth2Client });
                this.oauth2Client = oauth2Client;
                return true;
            }, e => {
                throw e;
            }
        )

    }

    /**
     * kick this mule sko'den
     */
    curator.run = function() {
        return this.recursePlaylist();
    }

    /**
     * get all the youtube playlist info..
     * @param {*} npt 
     */
    curator.recursePlaylist = function(npt) {
        return this.getPlaylistInfo(npt).then(
            dat => {
                // console.log('dat', dat);
                this.playlistList = this.playlistList.concat(dat.items);
                if (dat.nextPageToken) {
                    this.recursePlaylist(dat.nextPageToken);
                } else {
                    console.log('might be done with playlist');
                    this.parseList();
                }
            },
            err=>{
                console.log('error...',err);
                throw err;
            }
        );
    }

    /**
     * parse the playlists we got from youtube, make it into something more easily readable...
     */
    curator.parseList = function() {
        this.playlistList.forEach(
            playlist => {
                let obj = {};
                obj['id'] = playlist.id;
                obj['etag'] = playlist.etag;
                obj['kind'] = playlist.kind;
                obj['title'] = playlist.snippet.localized.title;
                this.parsedList.push(obj);
            }
        )

        this.currateList();
    }

    curator.getPlaylistInfo = async function(nextPageToken) {

        const requestDetails = {
            part: 'snippet, contentDetails',
            channelId: CHANNELID,
            maxResults: 50,
            auth: this.oauth2Client
        };

        if (nextPageToken) {
            requestDetails['pageToken'] = nextPageToken;
        }

        return gsapi.playlists.list(requestDetails).then(
            dat => {

                return dat.data;

            },
            err => {
                throw err;
            }
        );

    }

    /**
     * run through the parsed list and create a playlist if needed, then upload all the videos to youtube lists
     */
    curator.currateList = async function() {

        let tracked = {};

        this.reports.reportList.forEach(report => {
            // console.log('report', report);
            try{

            let playListName;

            if (report.division && report.division.length > 0 && report.division != "undefined" && report.division != "null") {
                let reportDiv = report.division;
                let divInf = _.find(this.divisionInfo, { divisionConcat: reportDiv });
                playListName = `Season ${this.seasonValue} ${divInf.displayName.trim()} Division`;
            } else if (report.division && report.division.length > 0) {
                playListName = `Season ${this.seasonValue} ${report.event.trim()}`;
            }else{

            }

            let youtubeplaylist = _.find(this.parsedList, { title: playListName });
            report.vodLinks.forEach(link => {
                //these must be youtube videos...
                if (link.indexOf('you') > -1) {
                    // console.log('link', link);
                    let id = returnId(link);
                    // console.log('id', id);
                    if (id) {
                        // console.log('youtubeplaylist', youtubeplaylist);
                        if (youtubeplaylist) {
                            this.insertVidToList(youtubeplaylist.id, id, report.matchId);
                        } else if (!tracked[playListName]) {
                            tracked[playListName] = true;
                            this.createPlaylist(playListName);
                            this.deferredInserts.push({ playListName, id, matchId: report.matchId });
                        } else if (tracked[playListName]) {
                            this.deferredInserts.push({ playListName, id, matchId: report.matchId });
                        }
                    }
                }
            });

            }catch(e){
                console.log(e);
                report.error = "ln 207 error"
                report.playlistCurrated = true;
                this.matchResultsArr.push({ matchId:report.matchId, vidId:'null', success: false });
            }

        });

        if (Object.keys(tracked).length > 0) {

            for (var i = 0; i < this.createPlaylistArr.length; i++) {
                let request = this.createPlaylistArr[i];
                // console.log('request', request);
                let createdPlaylist = await gsapi.playlists.insert(request).catch(e => { console.log('err', e) });
                if (createdPlaylist) {

                    console.log('createdPlaylist:', createdPlaylist)
                    let obj = {};
                    obj['id'] = createdPlaylist.data.id;
                    obj['etag'] = createdPlaylist.data.etag;
                    obj['kind'] = createdPlaylist.data.kind;
                    obj['title'] = createdPlaylist.data.snippet.localized.title;
                    this.parsedList.push(obj);

                    this.deferredInserts.forEach(
                        defIns => {
                            let youtubeplaylist = _.find(this.parsedList, { title: defIns.playListName });
                            if (youtubeplaylist) {
                                this.insertVidToList(youtubeplaylist.id, defIns.id, defIns.matchId);
                            }
                        });
                } else {
                    console.log('playlist create error!', request);
                }

                await promMock(2000, 'delay');

            }
            if (this.playlistaddarr.length > 0) {
                this.insertVideos();
            }

        } else {
            this.insertVideos();
        }

    }

    curator.insertVideos = async function() {

        let results = [];

        for (var i = 0; i < this.playlistaddarr.length; i++) {
            let request = this.playlistaddarr[i];
            // console.log('request', request);
            try {

                let r = await gsapi.playlistItems.insert(request).then(r => { return r }, e => { throw e });
                results.push(r);
                this.matchResultsArr.forEach(
                    i => {
                        if (i.vidId === request.resource.snippet.resourceId.videoId) {
                            results.push({ matchId: i.matchId, result: r });
                            i.success = true;
                        }
                    }
                )
                this.playlistAdded += 1;

                await promMock(2000, 'delay');

            } catch (e) {
                console.log(e);

                this.errorCount += 1;
                this.matchResultsArr.forEach(
                    i => {
                        if (i.vidId === request.resource.snippet.resourceId.videoId) {
                            results.push({ matchId: i.matchId, result: e });
                            i.success = false;
                        }
                    }
                )
            }
        }

        // console.log('this.matchResultsArr', this.matchResultsArr, results);

        let reportedMatchIds = [];

        this.reports.reportList.forEach(
            r => {
                // console.log(results);
                this.matchResultsArr.forEach(
                    i => {
                        try {
                            r.playlistCurrated = true;
                            let e = _.find(results, { matchId: i.matchId });
                            if (i.matchId == r.matchId && i.success == false) {
                                // console.log('///////', e.result.response.data);
                                r.error = `${utils.returnByPath(e,'result.response.data.error.code')} - ${utils.returnByPath(e,'result.response.data.error.message')} `;
                            }
                        } catch (e) {
                            console.log(' i ', i);
                            console.log(' e ', e);
                        }

                    }
                )

            }
        );
        console.log('Finished Reporting to Youtube; upserting caster reports.');

        var timestamp = Date.now();

        const dataObj = {
            timestamp: timestamp,
            results: this.matchResultsArr
        }

        const youtubeReport = {
            dataName: "youtubeReport",
            span: '',
            stat: '',
            data: dataObj
        }

        System.findOneAndUpdate({
            "data.timestamp": timestamp
        }, youtubeReport, {
            new: true,
            upsert: true
        }).then(
            saved => {
                const logObj = {};
                logObj.logLevel = 'SYSTEM/Worker';
                logObj.timeStamp = new Date().getTime();
                logObj.location = 'YouTubeCurator'
                logObj.action = `Upload Youtube Playlists`
                logger(logObj);
                utils.errLogger('youtube curator run', null, 'youtube currator ran ok');
            },
            err => {
                const logObj = {};
                logObj.logLevel = 'ERR:SYSTEM/Worker';
                logObj.timeStamp = new Date().getTime();
                logObj.location = 'YouTubeCurator'
                logObj.action = `Error saving youtube playlist`
                logger(logObj);
                utils.errLogger('youtube curator run', err);
            }
        );

        // need to save the results back to the caster reports...
        CasterReportMethod.upsertCasterReport(this.reports.reportList).catch(e=>{
            console.log(e);
        });

    }

    curator.createPlaylist = function(title) {
        let request = {
            "part": [
                "snippet,status"
            ],
            "resource": {
                "snippet": {
                    "title": title
                },
                "status": {
                    "privacyStatus": "public"
                }
            }
        }

        // let prom = gsapi.playlists.insert(request);
        // this.createPlaylistArr.push(prom);
        this.createPlaylistArr.push(request);
    }

    curator.insertVidToList = function(playlistId, vidId, matchId) {

        this.matchResultsArr.push({ matchId, vidId, success: false });

        let request = {
            "part": [
                "snippet"
            ],
            "resource": {
                "snippet": {
                    "playlistId": playlistId,
                    "resourceId": {
                        "kind": "youtube#video",
                        "videoId": vidId
                    }
                }
            }
        };

        this.playlistaddarr.push(request);

    }



    return curator;

}

async function myFunction() {

    let cur = new PlaylistCurator();

    cur.ready().then(
        r => {
            console.log('curator ready');
            cur.run().catch(
                err=>{
                    console.log('youtube currator error..');
                }
            );
        },
        e => {
            console.log('ready error', e);
        }
    )

}

function getDivisionInfo() {
    return Division.find({
        public: true
    }).then((foundDiv) => {
        return foundDiv;
    }, (err) => {
        throw err;
    });
}

function getUncrrated() {
    return CasterReportMethod.getUnCurratedReports().then(
        saved => {
            let toReturn = [];
            let totalVideos = 0;
            saved.forEach(
                s => {

                    if (totalVideos < UNCURRATED_AMOUNT) {
                        totalVideos = totalVideos + s.vodLinks.length;
                        toReturn.push(s);
                    }
                }
            );

            returnObject = {
                reportList: toReturn,
                thisBatch: toReturn.length,
                totalBatch: saved.length
            }

            console.log('uncurrated report obj', returnObject);

            return returnObject;
        },
        err => {
            throw err;
        }
    );
}

function returnId(str) {
    return getAllUrlParams(str)['v'];
}

function getAllUrlParams(url, forceLower) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // set parameter name and value (use 'true' if empty)
            var paramName = a[0];
            var paramValue = typeof(a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            paramName = paramName;
            if (forceLower) {
                paramName = paramName.toLowerCase();
            }

            if (typeof paramValue === 'string') paramValue = forceLower ? paramValue.toLowerCase() : paramValue;

            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {

                // create key if it doesn't exist
                var key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];

                // if it's an indexed array e.g. colors[2]
                if (paramName.match(/\[\d+\]$/)) {
                    // get the index value and add the entry at the appropriate position
                    var index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    // otherwise add the value to the end of the array
                    obj[key].push(paramValue);
                }
            } else {
                // we're dealing with a string
                if (!obj[paramName]) {
                    // if it doesn't exist, create property
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    // if property does exist and it's a string, convert it to an array
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    // otherwise add the property
                    obj[paramName].push(paramValue);
                }
            }
        }
    }

    if (Object.keys(obj).length == 0) {
        let urlArr = url.split('/');
        obj['v'] = urlArr[urlArr.length - 1];
    }

    return obj;
}


module.exports = myFunction;


function promMock(delay, toReturn, toReject) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (toReject) {
                reject(toReturn);
            } else {
                resolve(toReturn)
            }
        }, delay);
    })
}