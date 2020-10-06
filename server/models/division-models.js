const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef Division
 * @type {object}
 * @property {number} sorting - Divisions sort order in lists
 * @property {string} displayName - Name for display of division
 * @property {string} divisionName - system name of division
 * @property {string} divisionCoast  - coast of the division, if applicable
 * @property {string} divisionConcat  - combination of the divisionName and divisionCoast
 * @property {number} maxMMR  - top level mmr for division
 * @property {number} minMMR  - lower bound of mmr for division
 * @property {Array.<string>} teams  - list of team display names of the division
 * @property {boolean} public  - flag true if division should be visible
 * @property {boolean} cupDiv  - special flag if this is a cup div 
 * @property {boolean} DRR  - flag true if this is a double round robin div
 * @property {Array.<string>} participants  - array of string names of teams that have participated in the cup
 * @property {Array.<string>} tournaments  - array of tournament references for cup divs
 * @property {string} moderator  - name of the division mod
 */

const divisionInfoSchema = new Schema({
    "sorting": Number,
    "displayName": String,
    "divisionName": String,
    "divisionCoast": String,
    "divisionConcat": String,
    "maxMMR": Number,
    "minMMR": Number,
    "teams": [String],
    "lastTouched": String,
    "public": Boolean,
    "cupDiv": Boolean,
    "DRR": Boolean,
    "participants": [String],
    "tournaments": [String], //tournament references for cup divs
    "moderator": String
});


const Division = mongoose.model('division', divisionInfoSchema);

module.exports = Division;