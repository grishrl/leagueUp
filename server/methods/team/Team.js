const _ = require('lodash');

function Team(){

    var team = {};
    team._id = "";
            team.teamName = '';
            team.teamName_lower = '';
            team.lookingForMore = false;
            team.availability = {
                monday: {
                    available: false,
                    startTime: null,
                    endTime: null,
                },
                tuesday: {
                    available: false,
                    startTime: null,
                    endTime: null,
                },
                wednesday: {
                    available: false,
                    startTime: null,
                    endTime: null,
                },
                thursday: {
                    available: false,
                    startTime: null,
                    endTime: null,
                },
                friday: {
                    available: false,
                    startTime: null,
                    endTime: null,
                },
                saturday: {
                    available: false,
                    startTime: null,
                    endTime: null,
                },
                sunday: {
                    available: false,
                    startTime: null,
                    endTime: null,
                },
            };

            team.competitiveLevel = null;
            team.descriptionOfTeam = null;
            team.rolesNeeded = {
                tank: false,
                meleeassassin: false,
                rangedassassin: false,
                support: false,
                offlane: false,
                healer: false,
                flex: false,
            };
            team.timeZone = "";
            team.teamMembers = [];
            team.pendingMembers = [];
            team.captain = null;
            team.teamMMRAvg = 0;
            team.divisionDisplayName = null;
            team.divisionConcat = null;
            team.questionnaire = {
                registered: null,
                pickedMaps: [],
            }
        team.assistantCaptain = [];
        team.ticker = null;
        team.history = [];
        team.hpMmrAvg = null;
        team.ngsMmrAvg = null;
        team.twitch = null;
        team.twitter = null;
        team.youtube = null;
        team.invitedUsers = [];
        team.stormRankAvg = 0;


        team.merge = function(obj){
            return _.merge(Team(), obj);
        }

        return team;
}

module.exports = Team;