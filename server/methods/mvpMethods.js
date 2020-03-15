const Mvp = require('../models/mvp-models');
const ProfileMethods = require('./profileMethods');
const SeasonInfo = require('./seasonInfoMethods');
const utils = require('../utils');

/*
CRUD for new MVP community data
*/


async function getAll() {
    return Mvp.find({}).lean().then(
        found => {
            found = found.sort((a, b) => {
                if (!a.timeStamp) {
                    return -1;
                } else if (!b.timeStamp) {
                    return -1;
                } else if (a.timeStamp > b.timeStamp) {
                    return -1
                } else {
                    return 1;
                }
            });
            // found.reverse();
            return found;
        },
        err => {
            throw err;
        }
    )
}

async function getList({
    type,
    listArr
}) {
    let query = {

    }
    query[type] = {
        $in: listArr
    };

    return Mvp.find(query).lean().then(
        found => {
            return found;
        },
        err => {
            throw err;
        }
    );
}

async function getById({ type, id }) {
    let query = {}
    query[type] = id;
    let mvpInf;
    if (type == 'match_id') {
        mvpInf = await Mvp.findOne(query).lean().then(
            found => {
                return found;
            },
            err => {
                throw err;
            }
        );
    } else {
        mvpInf = await Mvp.find(query).lean().then(
            found => {
                return found;
            },
            err => {
                throw err;
            }
        );
    }

    if (mvpInf && mvpInf.player_id) {
        let displayName = await ProfileMethods.returnDisplayNameFromId(mvpInf.player_id);
        mvpInf.displayName = displayName
    }
    return mvpInf;
}

async function getBySeason(season) {
    return Mvp.find({ season: season }).lean().then(
        found => {
            return found;
        },
        err => {
            throw err;
        }
    )
}


async function upsert(obj) {

    if (obj.displayName) {
        let player_id = await ProfileMethods.returnIdFromDisplayName(obj.displayName);
        obj.player_id = player_id;
    }

    obj.timeStamp = Date.now();
    obj.likes = 0;

    let season = await SeasonInfo.getSeasonInfo();

    obj.season = season.value;

    let upsert = await Mvp.findOneAndUpdate({
        match_id: obj.match_id
    }, obj, {
        new: true,
        upsert: true
    }).then(
        newItem => {
            return newItem;
        },
        err => {
            throw err;
        }
    )

    return upsert;

}

async function deleteList({ type, list }) {
    let query = {};
    query[type] = { $in: list };
    return Mvp.deleteMany(query).lean().then(
        deleted => {
            return deleted;
        },
        err => {
            throw err;
        }
    );
}

async function deleteById({
    type,
    id
}) {
    let query = {};
    query[type] = id;

    return Mvp.deleteOne(query).lean().then(
        deleted => {
            return deleted;
        },
        err => {
            throw err;
        }
    );
}

async function like(id, likerId) {

    return Mvp.findOne({ match_id: id }).then(
        found => {
            if (found) {
                let foundObj = utils.objectify(found);
                let canLike = true;
                foundObj.likeHistory.forEach(id => {
                    if (id == likerId) {
                        canLike = false;
                    }
                });
                if (canLike) {
                    if (found.likes) {
                        found.likes += 1;
                    } else {
                        found.likes = 1;
                    }

                    if (found.likeHistory.length > 0) {
                        found.likeHistory.push(likerId);
                    } else {
                        found.likeHistory = [likerId];
                    }
                }
                return found.save().then(
                    saved => {
                        return saved;
                    },
                    err => {
                        throw err;
                    }
                )
            } else {
                return false;
            }
        },
        err => {
            throw err;
        }
    )
}


module.exports = {
    getAll,
    getList,
    getById,
    upsert,
    deleteList,
    deleteById,
    like,
    getBySeason
}