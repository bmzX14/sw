"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
// Bootstrap the Express server with the configured port.
const PORT = process.env.PORT || 8000;
app_1.app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
