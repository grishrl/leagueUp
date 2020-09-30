const System = require('../../models/system-models').system;
const User = require('../../models/user-models');
const utils = require('../../utils');

async function getNgsAvgRank(verifiedRankHistory) {

    let requiredRanks = await System.findOne({ dataName: "requiredRankInfo" });

    let highest = 0;

    if (requiredRanks) {

        let requiredRanksArray = [];

        requiredRanks.data.forEach(rr => {
            if (rr.required) {
                verifiedRankHistory.forEach(vh => {
                    if (rr.year == vh.year && rr.season == vh.season && vh.status == 'verified') {
                        requiredRanksArray.push(vh);
                    }
                });
            }
        });

        requiredRanksArray.forEach(vr => {
            if (vr.level > highest) {
                highest = vr.level;
            }
        });

        return highest;

    } else {

        throw new Error('Error finding required ranks');

    }
}

async function teamRankAverage(teamMembers) {
    let promArr = [];
    teamMembers.forEach(
        member => {
            promArr.push(
                User.findOne({
                    displayName: member
                }));
        }
    );
    return Promise.all(promArr).then(
        members => {
            return getTeamAvgFromMembers(members);
        },
        err => {
            throw err;
        }
    )

}

async function getTeamAvgFromMembers(membersArray) {

    let secondArr = [];
    membersArray.forEach(member => {
        let memberObj = utils.objectify(member);
        if (utils.returnBoolByPath(memberObj, 'verifiedRankHistory')) {
            secondArr.push(getNgsAvgRank(memberObj.verifiedRankHistory));
        }
    });
    return Promise.all(secondArr).then(
        secondArrReturn => {
            let numerator = 0;
            let avg = 0;
            secondArrReturn.sort();
            secondArrReturn.reverse();
            let runTo = secondArrReturn.length >= 4 ? 4 : secondArrReturn.length;
            for (var i = 0; i < runTo; i++) {
                numerator += secondArrReturn[i];
            }
            if (runTo == 4) {
                avg = Math.floor(numerator / runTo);
            }
            return avg;
        },
        err => {
            throw err;
        }
    )

}

module.exports = {
    getNgsAvgRank,
    teamRankAverage,
    getTeamAvgFromMembers
}