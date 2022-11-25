import http from 'http';
import express from 'express';
import { json } from 'body-parser';
import logging from './config/logging';
import config from './config/config';
import endpoints from './routes/endpoints';

const NAMESPACE = 'Server';
const router = express();

/** Logging the request */
router.use((req, res, next) => {
    logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}] `);

    res.on('finish', () => {
        logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
    });

    next();
});

/** Parse the request */
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

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
router.use('/api/v1', endpoints);

/** Error Handling */
router.use((req, res, next) => {
    const error = new Error('Something went wrong');

    return res.status(500).json({
        message: error.message
    });
});

/** Create the server */
const httpServer = http.createServer(router);
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`));
