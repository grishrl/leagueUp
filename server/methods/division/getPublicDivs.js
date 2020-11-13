const Division = require('../../models/division-models')

async function getPublicDivs() {
    return Division.find({
        public: true
    }).then((foundDiv) => {
        return foundDiv;
    }, (err) => {
        return err;
    });
}
module.exports = getPublicDivs;