/**
 *@name debugLogger
 *@function 
 *@description debug log cause reasons
 * 
 * @param {*} success success object
 * @param {*} error error object
 * @param {*} location calling location
 */
function debugLogger(success, error, location) {
    if (process.env.debugLogger == 'true') {
        if (error) {
            console.log('error', error);
        }
        if (success) {
            console.log('success', success)
        }
        if (location) {
            console.log('location', location);
        }
    }
}

module.exports = debugLogger;