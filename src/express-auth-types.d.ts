/**
 * Various Interfaces used throughout this project. Add additional Interfaces here
 */

/**
 * Interface for the object used to build a database query. This is currently built from
 * a Request.query object.
 * queryOperator is required to be included as one of the parameters
 */
export interface IDbQuery {
	queryOperator: string;
	[x: string]: any
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
/**
 * Interface for a Vertex
 */
export interface IVertex {
	'@class': string;
	'@rid': string;
	'@type': string;
	'@version': string;
	created_date: string;
	id: string;
	[x: string]: any;
}
/**
 * Interface for a Person
 */
export interface IPerson extends IVertex {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
}
