import express, { Request, Response, Application } from 'express';
import session from 'express-session';
import flash from 'express-flash';
import initAuthEndpoints from './routes/auth-endpoints';
import initSystemEndpoints from './routes/system-endpoints';
import swaggerDocs from './config/swaggerDoc';
import getDbConn from './config/orient-db';
import connectRedis, {RedisStoreOptions} from 'connect-redis';
import initPassport from './config/passport';
import {logger} from './config/logger';
import initDbEndpoints from './routes/db-endpoints';

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
initSystemEndpoints(app, logger);
initAuthEndpoints(app, db);
initDbEndpoints(app, db);
swaggerDocs(app); // Must be initialized last to account for all routes
/**
 * Start the listener
 */
app.listen(port, () => {
	let dockerPort = port;
	let baseUrl = `http://localhost:${process.env.WEB_LOCAL_PORT}`;
	logger.info(`express-auth-boilerplate listening on:\n Docker port: ${dockerPort}\n Locally at: ${baseUrl}\n`);
});
