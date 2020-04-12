/**
 * This file is to setup logging of all requests
 */
import {NextFunction, Request, Response} from "express";
import {logger} from "./logger";
import {IRequestLogEntry, LogLevels} from "../../express-auth-types";

/**
 * Middleware function to setup logging of all requests made to this server
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
	const startTime = new Date();
	let body: any = null;
	if (req.body && Object.keys(req.body) && Object.keys(req.body).length) {
		body = Object.assign({}, req.body);
		if (body.password) {
			body.password = 'xxxxxSECRETxxxxx'; // Do not store a password
		}
		if (body.verify_password) {
			body.verify_password = 'xxxxxSECRETxxxxx'; // Do not store a password
		}
	}
	res.on('finish', () => {
		const { rawHeaders, httpVersion, method, socket, url } = req;
		const { remoteAddress, remoteFamily } = socket;
		const resHeaders = res.getHeaders();
		const logEntry: IRequestLogEntry = {
			httpVersion: httpVersion,
			level: LogLevels.INFO,
			message: 'Route visited',
			method: method,
			processing_time_ms: new Date().getTime() - startTime.getTime(),
			remote_family: remoteFamily,
			request_body: body ? JSON.stringify(body) : null,
			request_headers: JSON.stringify(rawHeaders),
			request_ip: remoteAddress,
			request_route: req.route ? req.route.path : null,
			request_url: url,
			response_headers: JSON.stringify(resHeaders),
			response_status: res.statusCode
		};
		logger.log(logEntry);
	});
	next();
}
