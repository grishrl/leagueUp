const Mvp = require('../models/mvp-models');
const ProfileMethods = require('./profileMethods');

/*
CRUD for new MVP community data
*/


async function getAll() {
    return Mvp.find({}).lean().then(
        found => {
            return res;
        },
        err => {
            throw err;
        }
    )
}

async function getList({ type, list }) {
    let query = {

    }
    query[type] = {
        $in: list
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


async function upsert(obj) {

    if (obj.displayName) {
        let player_id = await ProfileMethods.returnIdFromDisplayName(obj.displayName);
        obj.player_id = player_id;
    }

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


module.exports = {
    getAll,
    getList,
    getById,
    upsert,
    deleteList,
    deleteById
}