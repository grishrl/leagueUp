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