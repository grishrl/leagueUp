const degenerate = [
    'withdrawn',
    'inactive'
];

function removeDegenerateTeams(teams, additional) {
    if (additional) {
        degenerate.concat(additoonal);
    }

    teams = teams.filter(a => {
        return nameContains(a.teamName, degenerate);
    });

    return teams;
}

function nameContains(teamName, check) {
    let match = true;
    const tname = teamName.toLowerCase();
    check.forEach(
        ck => {
            ck = ck.toLowerCase();
            if (tname.indexOf(ck) > -1) {
                match = false;
            }
        }
    );
    return match;
};

async function getCptId(cptName) {
    let cptID = await User.findOne({
        displayName: cptName
    }).then(
        res => {
            return res;
        },
        err => {
            return err;
        }
    );
    return cptID;
}

module.exports = {
    removeDegenerateTeams,
    getCptId
}