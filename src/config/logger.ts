/**
 * This file sets up the winston logger
 * https://www.npmjs.com/package/winston
 */
import { createLogger, format, transports } from 'winston';
import Transport from 'winston-transport';
import * as events from 'events';
import {IOrientDbTransportConfig} from "../express-auth-types";
import {Db} from "orientjs";
import {createVertex} from "../helpers/db-helpers";

class AppEventEmitter extends events.EventEmitter {};
export const appEventEmitter = new AppEventEmitter();

export class OrientDbTransport extends Transport {
	private readonly _db: Db;

	constructor(opts: IOrientDbTransportConfig) {
		super(opts);
		this._db = opts.db;
	}

	get db(): Db {
		return this._db;
	}

	log(info:any, next:() => void) {
		setImmediate(() => {
			this.emit('logged', info);
		});
		if (this.db) {
			createVertex('Log', info, this.db);
		}
		next();
	}
}

export const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp({
			format: 'MM/DD/YYYY HH:mm:ss'
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

if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console({
		format: format.combine(
			format.colorize(),
			format.simple()
		)
	}));
}
