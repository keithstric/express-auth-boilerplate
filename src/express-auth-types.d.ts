/**
 * Various Interfaces used throughout this project. Add additional Interfaces here
 */
import Transport from 'winston-transport';
import {Db} from "orientjs";

/**
 * Interface for the object used to build a database query. This is currently built from
 * a Request.query object.
 * queryOperator is required to be included as one of the parameters
 */
export interface IDbQuery {
	queryOperator: string;
	[x: string]: any;
}
/**
 * enum of the winston Log Levels
 */
export enum LogLevels {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	VERBOSE = 'verbose',
	DEBUG = 'debug',
	SILLY = 'silly'
}
/**
 * Interface for a log entry
 */
export interface ILogEntry {
	message: string;
	level: LogLevels;
	service: string;
	timestamp: string;
}

export interface IOrientDbTransportConfig extends Transport.TransportStreamOptions {
	db?: Db
}
