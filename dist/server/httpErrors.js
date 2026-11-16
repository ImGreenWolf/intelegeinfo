"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHttpError = void 0;
const handleHttpError = (error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }
    const declaredStatus = Number(error.status || error.statusCode);
    let status = Number.isInteger(declaredStatus) && declaredStatus >= 400 && declaredStatus <= 599 ? declaredStatus : 500;
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name))
        status = 401;
    if (error.name === 'PrismaClientValidationError')
        status = 400;
    if (error.code === 'P2025')
        status = 404;
    if (error.code === 'P2002')
        status = 409;
    if (status >= 500)
        console.error('HTTP request failed:', error);
    res.status(status).json({ error: status === 413 ? 'Request body is too large' :
            status === 401 ? 'Invalid or expired credentials' : status === 404 ? 'Not found' :
                status < 500 ? 'Invalid request' : 'Internal server error' });
};
exports.handleHttpError = handleHttpError;
