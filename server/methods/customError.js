class CustomError extends Error {
    constructor(reason, message) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(message);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError);
        }

        this.name = 'CustomError';
        // Custom debugging information
        this.reason = reason;
        this.date = new Date();
    }
}

module.exports = CustomError;