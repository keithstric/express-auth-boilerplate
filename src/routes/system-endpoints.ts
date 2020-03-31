import { Application, Request, Response } from 'express';
import { Logger, QueryOptions } from 'winston';
import {ILogEntry, IOrientDbLogQueryOptions} from '../express-auth-types';
import authReqMiddleware from '../config/restrict-path';

const initSystemEndpoints = (app: Application, logger: Logger) => {
	/**
	 * @swagger
	 * /api/logs:
	 *   get:
	 *     tags:
	 *       - system
	 *     description: Returns log entries from the system logs
	 *     responses:
	 *       200:
	 *         description: Logs
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 $ref: '#/components/schemas/Log'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *     parameters:
	 *       - name: from
	 *         description: Date where logs should start (use new Date().toISOString(), default yesterday)
	 *         in: query
	 *         schema:
	 *           type: string
	 *       - name: until
	 *         description: Date where logs should end (use new Date().toISOString(), default today)
	 *         in: query
	 *         schema:
	 *           type: string
	 *       - name: limit
	 *         description: Number of entries to return (default 10)
	 *         in: query
	 *         schema:
	 *           type: number
	 *           default: 10
	 *       - name: start
	 *         description: Starting row (default 0)
	 *         in: query
	 *         schema:
	 *           type: number
	 *           default: 0
	 *       - name: order
	 *         description: Sort order of entries
	 *         in: query
	 *         schema:
	 *           type: string
	 *           enum: [asc, desc]
	 *       - name: logType
	 *         description: The type of log
	 *         in: query
	 *         schema:
	 *           type: string
	 *           enum: [Log, RequestLog]
	 */
	app.get('/api/logs', authReqMiddleware, (req: Request, res: Response) => {
		const logOpts: IOrientDbLogQueryOptions = {
			from: req.query.from ? new Date(req.query.from) : new Date((new Date() as any) - (24 * 60 * 60 * 1000)),
			until: req.query.until ? new Date(req.query.until) : new Date(),
			limit: req.query.limit || 10,
			start: req.query.start || 0,
			order: req.query.order || 'desc',
			fields: ['message','level','service','timestamp'],
			logType: req.query.logType || 'Log'
		};
		logger.query(logOpts, (err: Error, results: ILogEntry[]) => {
			if (err) {
				res.status(500).send(err);
			}
			res.send(results);
		});
	});
};

export default initSystemEndpoints;
