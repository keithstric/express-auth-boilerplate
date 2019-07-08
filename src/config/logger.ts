import { createLogger, format, transports } from 'winston';
import * as events from 'events';

class AppEventEmitter extends events.EventEmitter {};
export const appEventEmitter = new AppEventEmitter();

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
	defaultMeta: {service: 'express-auth-boilerplate'},
	transports: [
		new transports.File({filename: 'express-auth-error.log', level: 'error'}),
		new transports.File({filename: 'express-auth.log'}),
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
