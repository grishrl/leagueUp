/*
This middleware method helps restricts routes by access,
The level provided must be string;
checks the requestings users adminLevel against the provided string
will return 403 if it is not there for the user, or next() in chain if it does
*/

function adminCheck(level, req, res, next) {
    var userInfo = req.user;
    if (!level) {
        next();
    } else if (Array.isArray(level)) {
        let returnUnauthorized = true;
        level.forEach(levelIt => {
            let c = userInfo.adminLevel[levelIt];
            if (c) {
                returnUnauthorized = false;
            }
        });
        if (returnUnauthorized) {
            res.status(403).send({
                "message": "Unauthorized for this action!"
            });
        } else {
            next();
        }
    } else if (typeof level == 'string') {
        if (userInfo.adminLevel && userInfo.adminLevel[level]) {
            next();
        } else {
            res.status(403).send({
                "message": "Unauthorized for this action!"
            });
        }
    }
}

module.exports = adminCheck;