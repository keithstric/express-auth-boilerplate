import { Application, Request, Response } from 'express';
import { Logger, QueryOptions } from 'winston';
import { ILogEntry } from '../express-auth-types';
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
	 *         description: Date where logs should start (use new Date().getTime(), default yesterday)
	 *         in: query
	 *         schema:
	 *           type: number
	 *       - name: until
	 *         description: Date where logs should end (use new Date().getTime(), default today)
	 *         in: query
	 *         schema:
	 *           type: number
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
	 */
	app.get('/api/logs', authReqMiddleware, (req: Request, res: Response) => {
		const logOpts: QueryOptions = {
			from: req.query.from ? new Date(req.query.from) : new Date((new Date() as any) - (24 * 60 * 60 * 1000)),
			until: req.query.until ? new Date(req.query.until) : new Date(),
			limit: req.query.limit || 10,
			start: req.query.start || 0,
			order: req.query.order || 'desc',
			fields: ['message','level','service','timestamp']
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
