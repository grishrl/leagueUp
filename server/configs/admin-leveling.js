/*
These wrappers ostensibly simplify the admin checking we want to do by
wrapping the whole function
 */

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

function matchLevel(req, res, next) {
    adminCheck('MATCH', req, res, next);
}

function scheduleGenerator(req, res, next) {
    adminCheck('SCHEDULEGEN', req, res, next);
}

function userACL(req, res, next) {
    adminCheck('ACL', req, res, next);
}

function events(req, res, next) {
    adminCheck('EVENTS', req, res, next);
}

function logs(req, res, next) {
    adminCheck('LOGS', req, res, next);
}

function multi(roleArray) {
    return function(req, res, next) {
        adminCheck(roleArray, req, res, next);
    }
}

module.exports = {
    teamLevel: teamLevel,
    userLevel: userLevel,
    divisionLevel: divisionLevel,
    casterLevel: casterLevel,
    matchLevel: matchLevel,
    scheduleGenerator: scheduleGenerator,
    userACL: userACL,
    events: events,
    logs: logs,
    multi: multi
}