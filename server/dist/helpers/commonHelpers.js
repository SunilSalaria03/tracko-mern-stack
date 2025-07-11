"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unixTimestamp = exports.success = exports.error = exports.failed = void 0;
const failed = (res, message = '') => {
    const finalMessage = typeof message === 'object'
        ? message.message || ''
        : message;
    return res.status(400).json({
        success: false,
        code: 400,
        message: finalMessage,
        body: {},
    });
};
exports.failed = failed;
const error = (res, err) => {
    const code = typeof err === 'object' && err.code ? err.code : 403;
    const message = typeof err === 'object' ? err.message || '' : err;
    return res.status(code).json({
        success: false,
        code,
        message,
        body: {},
    });
};
exports.error = error;
const success = (res, message = '', data) => {
    const finalMessage = typeof message === 'object'
        ? message.message || ''
        : message;
    return res.status(200).json({
        success: true,
        code: 200,
        message: finalMessage,
        body: data,
    });
};
exports.success = success;
const unixTimestamp = () => Math.floor(Date.now() / 1000);
exports.unixTimestamp = unixTimestamp;
//# sourceMappingURL=commonHelpers.js.map