const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const matchSchema = new Schema({
    "season": Number,
    "division": Object,
    "active": Boolean
}, { strict: false, useNestedStrict: false });

/*
[{
    "season": 6,
    "division": {
        "division-e-east": {
            "participants": [],
            "matches": [{
                "round": 1,
                "home": {
                    "id": "ID 3",
                    "points": 1
                },
                "away": {
                    "id": "ID 4",
                    "points": 0
                }
            }],
            "roundSchedules": {
                "1": [{
                        "home": "Team 14",
                        "away": "Team 13"
                    },
                    {
                        "home": "Team 11",
                        "away": "Team 2"
                    },
                    {
                        "home": "Team 4",
                        "away": "Team 12"
                    },
                    {
                        "home": "Team 3",
                        "away": "Team 7"
                    },
                    {
                        "home": "Team 10",
                        "away": "Team 5"
                    },
                    {
                        "home": "Team 8",
                        "away": "Team 17"
                    },
                    {
                        "home": "Team 9",
                        "away": "Team 1"
                    },
                    {
                        "home": "Team 16",
                        "away": "Team 19"
                    },
                    {
                        "home": "Team 15",
                        "away": "Team 18"
                    },
                    {
                        "home": "Team 6",
                        "away": null
                    }
                ],
                "2": []
            }
        },
        "division-d-east": {
            "participants": [],
            "matches": []
        }
    }
}]
*/

const Scheduling = mongoose.model('schedule', matchSchema);

module.exports = Scheduling;