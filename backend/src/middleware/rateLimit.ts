const rateLimit = require('express-rate-limit')

// Shared request limiter that can be attached to sensitive routes.
module.exports = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
    })
