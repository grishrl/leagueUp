const onePerRound = require('swiss-pairing')({
    maxPerRound: 1
})
const twoPerRound = require('swiss-pairing')({ maxPerRound: 2 });

console.log(Date.now());

var odd = {
    participants: [{
            id: 1,
            seed: 1000
        },
        {
            id: 2,
            seed: 1050
        },
        {
            id: 3,
            seed: 950
        }
    ],
    matches: []
}

// console.log('generate round 1 ', twoPerRound.getMatchups(1, odd.participants, odd.matches));

var even = {
    participants: [{
            id: 'ID 1',
            seed: 700
        },
        {
            id: 'ID 2',
            seed: 625
        },
        {
            id: 'ID 3',
            seed: 950
        },
        {
            id: 'ID 4',
            seed: 800
        }
    ],
    matches: []
}

var round1 = twoPerRound.getMatchups(1, even.participants, even.matches);
round1.forEach(match => {
    let matchObj = {
        round: 1,
        home: {
            id: match.home,
            points: 2
        },
        away: {
            id: match.away,
            points: 0
        }
    }
    even.matches.push(matchObj);
});
console.log(JSON.stringify(even.matches));
console.log(JSON.stringify(twoPerRound.getStandings(2, even.participants, even.matches)));
var round2 = twoPerRound.getMatchups(2, even.participants, even.matches);
round2.forEach(match => {
    let matchObj = {
        round: 2,
        home: {
            id: match.home,
            points: 2
        },
        away: {
            id: match.away,
            points: 0
        }
    }
    even.matches.push(matchObj);
});
console.log(JSON.stringify(twoPerRound.getStandings(3, even.participants, even.matches)));
// var round3 = twoPerRound.getMatchups(3, even.participants, even.matches);
// round3.forEach(match => {
//     let matchObj = {
//         round: 1,
//         home: {
//             id: match.home
//         },
//         away: {
//             id: match.away
//         }
//     }
//     even.matches.push(matchObj);
// });


console.log(JSON.stringify(round1));
console.log(JSON.stringify(round2));

// console.log(JSON.stringify(round3));

var byeTest = {
    participants: [{
            id: 'Team 1',
            seed: 3636,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 2',
            seed: 4001,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 3',
            seed: 4001,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 4',
            seed: 4011,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 5',
            seed: 4029,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 6',
            seed: 4030,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 7',
            seed: 4043,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 8',
            seed: 4044,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 9',
            seed: 4066,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 10',
            seed: 4142,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 11',
            seed: 4174,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 12',
            seed: 4179,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 13',
            seed: 4183,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 14',
            seed: 4194,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 15',
            seed: 4199,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 16',
            seed: 4209,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 17',
            seed: 4233,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 18',
            seed: 4270,
            disbanded: false,
            droppedOut: false
        },
        {
            id: 'Team 19',
            seed: 4362,
            disbanded: false,
            droppedOut: false
        }
    ],
    matches: [{
            round: 1,
            home: {
                id: 'Team 19',
                points: 1
            },
            away: {
                id: 'Team 17',
                points: 1
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 18',
                points: 0
            },
            away: {
                id: 'Team 14',
                points: 2
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 15',
                points: 1
            },
            away: {
                id: 'Team 13',
                points: 1
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 11',
                points: 1
            },
            away: {
                id: 'Team 10',
                points: 1
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 16',
                points: 1
            },
            away: {
                id: 'Team 7',
                points: 1
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 9',
                points: 1
            },
            away: {
                id: 'Team 4',
                points: 1
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 8',
                points: 2
            },
            away: {
                id: 'Team 6',
                points: 0
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 2',
                points: 0
            },
            away: {
                id: 'Team 3',
                points: 2
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 5',
                points: 1
            },
            away: {
                id: 'Team 1',
                points: 1
            }
        },
        {
            round: 1,
            home: {
                id: 'Team 12',
                points: 2
            },
            away: {
                id: null,
                points: 0
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 7',
                points: 2
            },
            away: {
                id: 'Team 19',
                points: 0
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 10',
                points: 1
            },
            away: {
                id: 'Team 17',
                points: 1
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 11',
                points: 2
            },
            away: {
                id: 'Team 15',
                points: 0
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 9',
                points: 1
            },
            away: {
                id: 'Team 18',
                points: 1
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 14',
                points: 2
            },
            away: {
                id: 'Team 8',
                points: 0
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 16',
                points: 0
            },
            away: {
                id: 'Team 4',
                points: 2
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 6',
                points: 1
            },
            away: {
                id: 'Team 12',
                points: 1
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 3',
                points: 1
            },
            away: {
                id: 'Team 5',
                points: 1
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 13',
                points: 2
            },
            away: {
                id: 'Team 1',
                points: 0
            }
        },
        {
            round: 2,
            home: {
                id: 'Team 2',
                points: 2
            },
            away: {
                id: null,
                points: 0
            }
        }
    ]
}

var oddModifiedMedian = twoPerRound.getModifiedMedianScores(2, odd.participants, odd.matches)
var evenModifiedMedian = onePerRound.getModifiedMedianScores(3, even.participants, even.matches)
var oddStandings = twoPerRound.getStandings(2, odd.participants, odd.matches)
var evenStandings = onePerRound.getStandings(3, even.participants, even.matches)
var oddMatchups = twoPerRound.getMatchups(2, odd.participants, odd.matches)
var evenMatchups = onePerRound.getMatchups(3, even.participants, even.matches)

//console.log(JSON.stringify(oddStandings));
//console.log(JSON.stringify(twoPerRound.getStandings(2, byeTest.participants, byeTest.matches)))

var byeMatchups = twoPerRound.getMatchups(3, byeTest.participants, byeTest.matches)
    //console.log(JSON.stringify(byeMatchups));

if (Object.entries(oddModifiedMedian).length !== 3) {
    throw new Error('getModifiedMedian incorrect for odd data')
}

if (Object.entries(evenModifiedMedian).length !== 4) {
    throw new Error('getModifiedMedian incorrect for even data')
}

if (oddStandings.length !== 3) {
    throw new Error('getStandings incorrect for odd data')
}

if (evenStandings.length !== 4) {
    throw new Error('getStandings incorrect for even data')
}

if (oddMatchups.length !== 2) {
    throw new Error('getStandings incorrect for odd data')
}

if (evenMatchups.length !== 2) {
    throw new Error('getStandings incorrect for even data')
}