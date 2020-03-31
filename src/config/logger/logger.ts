/**
 * This file sets up the winston logger
 * https://www.npmjs.com/package/winston
 */
import {createLogger, format, transports} from 'winston';
import * as events from 'events';
import {OrientDbTransport} from "./orientdb-transport";
import {LogLevels} from "../../express-auth-types";
import getDbConn from "../orient-db";

export const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD\'T\'HH:mm:ss.SSS\'Z\''
		}),
		format.errors({stack: true}),
		format.splat(),
		format.json()
	),

	defaultMeta: {service: 'express-auth-boilerplate', timestamp: new Date().toISOString()},
	transports: [
		new transports.Console({level: 'error'})
	]
});

/**
 * Add our custom OrientDb logger transport
 */
const db = getDbConn();
logger.add(new OrientDbTransport({level: LogLevels.INFO, db: db}));
if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console({
		format: format.combine(
			format.colorize(),
			format.simple()
		)
	}));
}
