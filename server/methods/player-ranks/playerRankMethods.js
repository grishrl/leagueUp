/**
 * New ranking process requires new methods to handle the calculations
 * reviewed: 10-5-2020
 * reviewer: wraith
 */
const System = require('../../models/system-models').system;
const User = require('../../models/user-models');
const utils = require('../../utils');


/**
 * @name getNgsAvgRank
 * @function
 * @description loops through the verified rank history of a user and returns the highest NGS rank number of the required seasons
 * @param {Object} verifiedRankHistory array of objects of a users verified rank history
 */
async function getNgsAvgRank(verifiedRankHistory) {

    //get the latest rank requirements from db
    let requiredRanks = await System.findOne({ dataName: "requiredRankInfo" });

    let highest = 0;


    if (requiredRanks) {

        //temp array
        let requiredRanksArray = [];
        let requiredRanksLength = 0;

        //loop through the ranks requirements
        requiredRanks.data.forEach(rr => {
            if (rr.required) {
                requiredRanksLength += 1;
                //if the rank is required, loop through the users verfied ranks to see if they have data for this season/year
                verifiedRankHistory.forEach(vh => {
                    if (rr.year == vh.year && rr.season == vh.season && vh.status == 'verified') {
                        //add to temp array
                        requiredRanksArray.push(vh);
                    }
                });
            }
        });

        //make sure the player has submited all required ranks 
        if (requiredRanksArray.length == requiredRanksLength) {
            //loop through our temp array and get the highest ngs rank numb
            requiredRanksArray.forEach(vr => {
                if (vr.level > highest) {
                    highest = vr.level;
                }
            });

        }

        return highest;

    } else {

        throw new Error('Error finding required ranks');

    }
}

/**
 * @name teamRankAverage
 * @function
 * @description accepts array of team members and returns the avg of the highest 4 ngs ranks among them
 * @param {Array.<string>} teamMembers array of team members
 */
async function teamRankAverage(teamMembers) {
    return User.find({
        displayName: {
            $in: teamMembers
        }
    }).lean().then(
        found => {
            return getTeamAvgFromMembers(found);
        },
        err => {
            throw err;
        }
    );
    // let promArr = [];
    //create a promise array to get each members info
    // teamMembers.forEach(
    //     member => {
    //         promArr.push(
    //             User.findOne({
    //                 displayName: member
    //             }));
    //     }
    // );
    // return Promise.all(promArr).then(
    //     members => {
    //         return getTeamAvgFromMembers(members);
    //     },
    //     err => {
    //         throw err;
    //     }
    // )

}

/**
 * @name getTeamAvgFromMembers
 * @function
 * @description accepts array of members and calculates the avg ngs storm rank from the members
 * @param {Array.<Object>} membersArray 
 */
async function getTeamAvgFromMembers(membersArray) {

    //create a promise array to resolve the highest ngs rank of all the members
    let secondArr = [];

    membersArray.forEach(member => {
        let memberObj = utils.objectify(member);
        if (utils.returnBoolByPath(memberObj, 'verifiedRankHistory')) {
            secondArr.push(getNgsAvgRank(memberObj.verifiedRankHistory));
        }
    });

    //resolve the promise array
    return Promise.all(secondArr).then(
        secondArrReturn => {
            let numerator = 0;
            let avg = 0;

            secondArrReturn.sort();
            secondArrReturn.reverse();

            //use 4 as the denominator or how many ever less members the team has
            let denominator = secondArrReturn.length >= 4 ? 4 : secondArrReturn.length;
            for (var i = 0; i < denominator; i++) {
                numerator += secondArrReturn[i];
            }

            avg = Math.floor(numerator / denominator);

            return avg;
        },
        err => {
            throw err;
        }
    )

}

async function getReportingTeamMembers(membersArray) {

    return returnUsersObjects(membersArray).then(
        users => {

            //create a promise array to resolve the highest ngs rank of all the members
            let secondArr = [];

            users.forEach(member => {
                let memberObj = utils.objectify(member);
                if (utils.returnBoolByPath(memberObj, 'verifiedRankHistory')) {
                    secondArr.push(getNgsAvgRank(memberObj.verifiedRankHistory));
                }
            });

            //resolve the promise array
            return Promise.all(secondArr).then(
                secondArrReturn => {
                    let count = 0;
                    secondArrReturn.forEach(
                        ind => {
                            if (ind != 0) {
                                count++;
                            }
                        }
                    );
                    return count;
                },
                err => {
                    throw err;
                }
            );


        },
        err => {
            throw err;
        }
    )

}

module.exports = {
    getNgsAvgRank,
    teamRankAverage,
    getTeamAvgFromMembers,
    getReportingTeamMembers
}

function returnUsersObjects(memArr) {

    let usersArray = [];

    if (typeof memArr[0] == 'object' && memArr[0].hasOwnProperty('displayName')) {

        memArr.forEach(mem => {
            usersArray.push(mem.displayName);
        })

    } else {

        usersArray.concat(memArr);

    }

    return User.find({ displayName: { $in: usersArray } }).lean().then(
        users => {
            return users;
        },
        err => {
            return err;
        }
    )

}