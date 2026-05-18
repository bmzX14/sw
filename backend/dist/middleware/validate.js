"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
// Ensure required request body fields exist before reaching the controller.
function validate(requiredFields) {
    return (req, res, next) => {
        const missing = requiredFields.filter((field) => !req.body[field]);
        if (missing.length > 0) {
            return res.status(400).json({
                error: `Missing fields: ${missing.join(", ")}`,
            });
        }
        next();
    };
}
exports.default = validate;
