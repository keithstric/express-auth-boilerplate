import express, { Request, Response, Application } from 'express';
import session from 'express-session';
import flash from 'express-flash';
import initAuthEndpoints from './routes/auth-endpoints';
import swaggerDocs from './swaggerDoc';
import getDbConn from './config/orient-db';
import connectRedis, {RedisStoreOptions} from 'connect-redis';
import initPassport from './config/passport';

/**
 * Setup the application
 */
const app: Application = express();
const port = parseInt(process.env.WEB_PORT);
const db = getDbConn();
/**
 * middleware
 */
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(flash())

app.use((err: Error, req: Request, res: Response, next: any) => {
	console.error('There was an error', err)
	res.send(err);
});
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
 * Setup passport, routes and swagger
 */
initPassport(app, db);
initAuthEndpoints(app, db);
swaggerDocs(app);
/**
 * Start the server listener
 * @returns express.server
 */
app.listen(port, () => {
	console.log(`express-auth-boilerplate started at docker port ${port} available locally at http://localhost:${process.env.WEB_LOCAL_PORT}`);
});
