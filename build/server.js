"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const logging_1 = __importDefault(require("./config/logging"));
const config_1 = __importDefault(require("./config/config"));
const endpoints_1 = __importDefault(require("./routes/endpoints"));
const NAMESPACE = 'Server';
const router = (0, express_1.default)();
/** Logging the request */
router.use((req, res, next) => {
    logging_1.default.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}] `);
    res.on('finish', () => {
        logging_1.default.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
    });
    next();
});
/** Parse the request */
router.use(express_1.default.urlencoded({ extended: false }));
router.use(express_1.default.json());
/** Rules of our API */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST');
        return res.status(200).json({});
    }
    if (req.method != 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    next();
});
/** Routes */
router.use('/api/v1', endpoints_1.default);
/** Error Handling */
router.use((req, res, next) => {
    const error = new Error('Something went wrong');
    return res.status(500).json({
        message: error.message
    });
});
/** Create the server */
const httpServer = http_1.default.createServer(router);
httpServer.listen(config_1.default.server.port, () => logging_1.default.info(NAMESPACE, `Server running on ${config_1.default.server.hostname}:${config_1.default.server.port}`));
