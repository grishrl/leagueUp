const _ = require('lodash');
const utils = require('./utils');
const debugLogger = require('./debug');

const trackAPI = [
    'user/hero-profile/path',
    'request/user/join/response',
    'schedule/get/matches/casted/playing'
];

function errTracingLogs(req, start, msg) {
    let log = false;
    trackAPI.forEach(val => {
        if (req.originalUrl.indexOf(val) > -1) {
            log = true;
        }
    });
    if (log) {
        console.log(
            `commonResponseHandler, ${msg}, ${start - Date.now()} ms`
        );
    }
}

function commonResponseHandler(req, res, requiredInputs, optionalInputs, executor) {
    let start = Date.now()
    try {
        errTracingLogs(req, start, 'Initial trace');
        let source = {};
        if (req.method == 'GET') {
            _.forEach(req.query, (v, k) => {
                source[k] = decodeURIComponent(v);
            });
        } else if (req.method == 'POST') {
            source = req.body
        } else {
            utils.errLogger(req.originalUrl, 'Bad Method');
            res.status(500).send(utils.returnMessaging(path, 'Bad Method'));
        }

        let validatedRequiredInputs = getInputs(requiredInputs, source);
        let validatedOptionalInputs = getInputs(optionalInputs, source);
        if (inputsWereValid(validatedRequiredInputs)) {
            errTracingLogs(req, start, 'Beginning Executor..');
            executor(req, res, validatedRequiredInputs, validatedOptionalInputs).then(
                response => {
                    errTracingLogs(req, start, 'Executor success');
                    debugLogger(response, null, 'responseHandler');
                    res.status(response.status).send(response.message);
                },
                err => {
                    errTracingLogs(req, start, 'Executor fail');
                    debugLogger(null, err, 'responseHandler');
                    let status = err.status ? err.status : 500;
                    res.status(status).send(err.message);
                }
            );
        } else {
            errTracingLogs(req, start, 'input errors...');
            handleInvalidInputsMessage(req, res, validatedRequiredInputs);
        }

    } catch (e) {
        errTracingLogs(req, start, 'caught errors...');
        utils.errLogger(req.originalUrl, e.stack);
        res.status(500).send(utils.returnMessaging(req.originalUrl, 'Internal Server Error', e.message));
    }
}

function getInputs(inputs, inputLocation) {

    if (utils.isNullOrEmpty(inputs)) {
        inputs = [];
    }
    if (!(inputs instanceof Array)) {
        inputs = [inputs]
    }

    const inputsVals = {};
    inputs.forEach((input) => {
        if (!utils.isNullorUndefined(inputLocation[input.name])) {
            var validator = utils.validateInputs[input.type];
            if (typeof(validator) == 'function') {
                inputsVals[input.name] = validator(inputLocation[input.name]);
                inputsVals[input.name].type = input.type;
            } else {
                utils.errLogger(`commonResponseHandler`, 'invalid input type', `${input.name}, ${input.type}`)
                inputsVals[input.name] = {
                    type: input.type,
                    valid: false
                }
            }
        } else {
            inputsVals[input.name] = {
                type: input.type,
                valid: false
            }
        }
    });
    return inputsVals;

}

function inputsWereValid(inputs) {
    let valid = true;
    _.forEach(inputs, (v, k) => {
        valid = valid && v.valid;
    });
    return valid;
}

function handleInvalidInputsMessage(req, res, inputs) {
    let message = '';
    _.forEach(inputs, (v, k) => {
        if (!v.valid) {
            message += ` ${k} - (${v.type}) parameter is required `;
        }
    });
    res.status(500).send(utils.returnMessaging(req.originalUrl, message));
}

function returnInvalidInputsMessage(req, inputs, optionals) {
    let response = {};
    let message = '';
    let andor = optionals ? ' or ' : ' and '
    let ind = 1;
    _.forEach(inputs, (v, k) => {
        if (!v.valid) {
            message += ` ${k} - (${v.type}) parameter is required `;
            if (ind < Object.keys(inputs).length) {
                message += andor;
                ind++;
            }
        }
    });
    response.status = 500;
    response.message = utils.returnMessaging(req.originalUrl, message);
    return response;
}

function requireOneInput(inputs) {
    let valid = false;
    _.forEach(inputs, (v, k) => {
        valid = valid || v.valid;
    });
    return valid;
}

module.exports = {
    commonResponseHandler,
    inputsWereValid,
    returnInvalidInputsMessage,
    requireOneInput
};