import { Application, Request, Response } from 'express';
import { Db } from 'orientjs';
import { getVerticesByType, getVertexByProperty, getVerticesByQuery } from '../helpers/db-helpers';
import { logger } from '../config/logger';
import authReqMiddleware from '../config/restrict-path';

const initDbEndpoints = (app: Application, db: Db) => {
	/**
	 * @swagger
	 * /vertices/{vertexType}:
	 *   get:
	 *     tags:
	 *       - Db
	 *     description: Get an array of vertices by type
	 *     responses:
	 *       200:
	 *         description: Array of vertices
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 $ref: '#/components/schemas/Vertex'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *     parameters:
	 *       - name: vertexType
	 *         description: The type of vertices to fetch (className of the vertex)
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - $ref: '#/components/parameters/ObjectQueryParam'
	 */
	app.get('/vertices/:vertexType', authReqMiddleware, (req: Request, res: Response) => {
		console.log('req.query=', req.query);
		if (Object.keys(req.query).length === 0) {
			getVerticesByType(req.params.vertexType, db).then((resp: any[]) => {
				res.send(resp);
			}).catch((err: Error) => {
				logger.error(`Error occurred at GET route /vertices/:vertexType: ${err.message}`);
				res.status(500).send(err);
			});
		}else {
			getVerticesByQuery(req.params.vertexType, req.query, db).then((resp: any) => {
				res.send(resp);
			}).catch((err: Error) => {
				logger.error(`Error occurred at GET route /vertices/:vertexType: ${err.message}`);
				res.status(500).send(err);
			});
		}
	});
	/**
	 * @swagger
	 * /vertex:
	 *   get:
	 *     tags:
	 *       - Db
	 *     description: Search for a vertex based on query params
	 *     responses:
	 *       200:
	 *         $ref: '#/components/responses/Vertex'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *     parameters:
	 *       - $ref: '#/components/parameters/ObjectQueryParam'
	 */
	app.get('/vertex', authReqMiddleware, (req: Request, res: Response) => {
		getVerticesByQuery('V', req.query, db).then((resp: any) => {
			res.send(resp);
		}).catch((err: Error) => {
			logger.error(`Error occurred at GET route /vertices/:vertexType/:vertexUuid: ${err.message}`);
			res.status(500).send(err);
		});
	});
	/**
	 * @swagger
	 * /vertex/{vertexUuid}:
	 *   get:
	 *     tags:
	 *       - Db
	 *     description: Get a specific vertex by uuid (slower than providing the type)
	 *     responses:
	 *       200:
	 *         $ref: '#/components/responses/Vertex'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *     parameters:
	 *       - name: vertexUuid
	 *         description: the uuid of the vertex
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 */
	app.get('/vertex/:vertexUuid', authReqMiddleware, (req: Request, res: Response) => {
		getVertexByProperty(null, 'uuid', req.params.vertexUuid, db).then((resp: any) => {
			res.send(resp);
		}).catch((err: Error) => {
			logger.error(`Error occurred at GET route /vertices/:vertexUuid: ${err.message}`);
			res.status(500).send(err);
		});
	});
}

export default initDbEndpoints;
