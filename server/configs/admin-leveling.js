const adminCheck = require("../adminCheck");

function teamLevel(req, res, next) {
    adminCheck('TEAM', req, res, next);
}

function userLevel(req, res, next) {
    adminCheck('USER', req, res, next);
}

function divisionLevel(req, res, next) {
    adminCheck('DIVISION', req, res, next);
}

function casterLevel(req, res, next) {
    adminCheck('CASTER', req, res, next);
}

function matchLevel(req, res, nest) {
    adminCheck('MATCH', req, res, nest);
}

module.exports = {
    teamLevel: teamLevel,
    userLevel: userLevel,
    divisionLevel: divisionLevel,
    casterLevel: casterLevel,
    matchLevel: matchLevel
}