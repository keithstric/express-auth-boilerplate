import express, {Request, Response, Application, NextFunction, response} from 'express';
import session from 'express-session';
import flash from 'express-flash';
import swaggerDocs from './config/swaggerDoc';
import getDbConn from './config/orient-db';
import connectRedis, {RedisStoreOptions} from 'connect-redis';
import initPassport from './config/passport';
import {logger} from './config/logger/logger';
import initEndpoints from './routes/index';
import {LogLevels} from "./express-auth-types";
import {OrientDbTransport} from "./config/logger/orientdb-transport";
import {requestLogger} from "./config/logger/request-logger-middleware";

/**
 * Setup the application
 */
const app: Application = express();
const port = parseInt(process.env.WEB_PORT);
const db = getDbConn();

/**
 * express middleware
 */
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(flash());

/**
 * Middleware to log all requests/responses made to this server
 */
app.use(requestLogger);
/**
 * Setup the redis store for session storage
 */
const redisOpts: RedisStoreOptions = {
	host: process.env.REDIS_HOST,
	port: parseInt(process.env.REDIS_PORT)
}
const RedisStore = connectRedis(session);
/**
 * express-session middleware. Sets up the cookie and how sessions are stored
 */
app.use(session({
	store: new RedisStore(redisOpts),
	secret: process.env.WEB_SESS_SECRET,
	name: process.env.WEB_SESS_NAME,
	resave: false,
	saveUninitialized: false
}));
/**
 * express middleware to handle unhandled errors
 */
app.use((err: Error, req: Request, res: Response, next: any) => {
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV === 'development' ? err : {};
	logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
	res.status(500).send(err);
});
/**
 * Setup passport middleware, routes and swagger
 */
initPassport(app, db);
/**
 * Initialize all the endpoints
 */
initEndpoints(app, db, logger);
/**
 * initialize Swagger. Must be initialized last to account for all routes
 */
swaggerDocs(app);
/**
 * Start the listener
 */
app.listen(port, () => {
	let dockerPort = port;
	let baseUrl = `http://localhost:${process.env.WEB_LOCAL_PORT}`;
	logger.info(`express-auth-boilerplate listening on:\n Docker port: ${dockerPort}\n Locally at: ${baseUrl}\n`);
});
