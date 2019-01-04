const Team = require('../models/team-models');
const teamSub = require('../subroutines/team-subs');
const userSub = require('../subroutines/user-subs');

const User = require('../models/user-models');

/*
check teams who have not been touched or have not been touched in 5 days
update this teams MMR
make sure that the users in this team are marked as a member (we will use the teams list of members as a trusted source)
check the teams division, if it is not in that division, remove the marker from the team (we will use the divisions list as a trusted source)
*/
async function updateTeamsNotTouched() {
    //connect to mongo db
    mongoose.connect(process.env.mongoURI, () => {
        console.log('connected to mongodb');
    });
    //generate the timestamp to compare to
    let date = new Date();
    date = date.getDate();
    let pastDate = 1000 * 60 * 60 * 24 * daysLastTouched;
    //grab teams who fit the criterias
    let teams = await Team.find({
        $or: [{
                lastTouched: null
            },
            {
                lastTouched: undefined
            },
            {
                lastTouched: {
                    $gt: date - pastDate
                }
            }
        ]
    }).then(
        (foundTeams) => {
            if (foundTeams) {
                return foundTeams
            } else {
                return null;
            }
        },
        (err) => {
            console.log("There was an error in the query", err);
            return null;
        }
    );

    //this batch will be returned
    let batch = [];
    if (teams != null) {
        //loop through the teams returned that met criteria
        teams.forEach(team => {
            //update the team mmr
            teamSub.updateTeamMmr(team);
            let teamMembers = [];
            team.forEach(member => {
                teamMembers.push(member.displayName);
            });
            //set the user data to reflect their membership of the team if they exist in the team member array
            User.updateMany({ displayName: { $in: teamMembers } }, { teamName: team.displayName, teamId: team._id }).then(
                (updated) => {
                    return updated;
                }, (err) => {
                    return null;
                }
            );
            let pendingMembers = [];
            team.pendingMembers.forEach(member => {
                pendingMembers.push(member);
            });
            //set the users data to reflect their pending queue to the team, if they exist in the pending member array
            User.updateMany({
                displayName: {
                    $in: pendingMembers
                }
            }, {
                pendingTeam: true
            }).then(
                (updated) => {
                    return updated;
                }, (err) => {
                    return null;
                }
            );
            team.lastTouched = date;
            let saved = await team.save().then(
                (sav) => {
                    return sav;
                },
                (err) => {
                    return null;
                }
            );
            if (saved == null) {
                console.log('Team wasn\'t saved');
            } else {
                batch.push(saved);
            }
        });
    }
    return batch;
}