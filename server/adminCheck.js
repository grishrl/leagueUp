/*
This middleware method helps restricts routes by access,
The level provided must be string;
checks the requestings users adminLevel against the provided string
will return 403 if it is not there for the user, or next() in chain if it does
*/

function adminCheck(level, req, res, next) {
    if (!level) {
        next();
    } else {
        var userInfo = req.user;
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