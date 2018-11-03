const adminCheck = require("../adminCheck");

function teamLevel(req, res, next) {
    adminCheck('TEAM', req, res, next);
}

function userLevel(req, res, next) {
    adminCheck('USER', req, res, next);
}

module.exports = {
    teamLevel: teamLevel,
    userLevel: userLevel
}