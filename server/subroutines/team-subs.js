const Team = require('../models/team-models');
const User = require('../models/user-models');


//subroutine to update a teams average mmr, this will run when it is passed a team and a Provided MMR
function updateTeamMmr(team) {
    console.log('welcome to the sub ', team)
    Team.findOne({ teamName_lower: team.teamName_lower }).then((foundTeam) => {
        let members = [];
        foundTeam.teamMembers.forEach(element => {
            members.push(element.displayName);
        });
        User.find({ displayName: { $in: members } }).then((users) => {
            if (users && users.length > 0) {
                let length = 0;
                let total = 0;
                users.forEach(user => {
                    if (user.lfgDetails.averageMmr) {
                        total += user.lfgDetails.averageMmr;
                        length += 1;
                    }
                });
                if (total > 1) {
                    foundTeam.teamMMRAvg = Math.round(total / length);
                } else {
                    console.log('we had a zero total');
                }
                foundTeam.save();
            }
        }, (err) => {
            console.log('updateMmr routine failed');
        })
    }, (err) => {
        console.log('updateMmr routine failed');
    });
    // team.teamMMRAvg = (team.teamMMRAvg + mmr) / 2;
    // team.save().then(
    //     (res) => {
    //         console.log('updated this teams mmr in a subroutine');
    //     },
    //     (err) => {
    //         console.log('subroutine failes', err)
    //     }
    // )
}

module.exports = {
    updateTeamMmr: updateTeamMmr
}