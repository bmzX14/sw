"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
// Fallback error handler for unhandled Express errors.
function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    res.status(status).json({
        message: err.message || "Internal server error",
    });
}
