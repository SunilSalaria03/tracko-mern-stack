"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const index_1 = __importDefault(require("./routes/index"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, database_1.connectDatabase)().then(() => {
    const http = (0, http_1.createServer)(app);
    app.use((0, cors_1.default)({
        origin: ['http://localhost:5173'],
        credentials: true
    }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, express_fileupload_1.default)());
    app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
    app.use('/', index_1.default);
    app.use('/admin', adminRoutes_1.default);
    app.use('/api', apiRoutes_1.default);
    app.use((req, res) => {
        res.status(404).json({ message: 'Not Found' });
    });
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).json({
            error: err.message || 'Internal Server Error'
        });
    });
    const PORT = process.env.PORT || 5002;
    http.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map