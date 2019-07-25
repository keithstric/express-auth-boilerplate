/**
 * This file contains routes pertinent to querying the DB
 * @exports initDbEndpoints
 */
import { Application, Request, Response } from 'express';
import { Db } from 'orientjs';
import { logger } from '../config/logger';
import authReqMiddleware from '../config/restrict-path';
import { getVerticesByType, getVertexByProperty, getVerticesByQuery } from '../helpers/db-helpers';

const initDbEndpoints = (app: Application, db: Db) => {
	/**
	 * @swagger
	 * /vertices:
	 *   get:
	 *     tags:
	 *       - Db
	 *     description: Search for a vertex based on query params
	 *     responses:
	 *       200:
	 *         $ref: '#/components/responses/VertexArray'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *       500:
	 *         $ref: '#/components/responses/Error'
	 *     parameters:
	 *       - $ref: '#/components/parameters/ObjectQueryParam'
	 *       - $ref: '#/components/parameters/DbQueryOperatorParam'
	 */
	app.get('/vertices', authReqMiddleware, (req: Request, res: Response) => {
		getVerticesByQuery('V', req.query, db).then((resp: any) => {
			res.send(resp);
		}).catch((err: Error) => {
			logger.error(`Error occurred at GET route /vertices: ${err.message}`);
			res.status(500).send(err);
		});
	});
	/**
	 * @swagger
	 * /vertices/{vertexType}:
	 *   get:
	 *     tags:
	 *       - Db
	 *     description: Get an array of vertices by type
	 *     responses:
	 *       200:
	 *         $ref: '#/components/responses/VertexArray'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *       500:
	 *         $ref: '#/components/responses/Error'
	 *     parameters:
	 *       - name: vertexType
	 *         description: The type of vertices to fetch (className of the vertex)
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [person]
	 *       - $ref: '#/components/parameters/ObjectQueryParam'
	 *       - $ref: '#/components/parameters/DbQueryOperatorParam'
	 */
	app.get('/vertices/:vertexType', authReqMiddleware, (req: Request, res: Response) => {
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
	 * /vertex/{vertexId}:
	 *   get:
	 *     tags:
	 *       - Db
	 *     description: Get a specific vertex by id (slower than providing the type)
	 *     responses:
	 *       200:
	 *         $ref: '#/components/responses/Vertex'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *       500:
	 *         $ref: '#/components/responses/Error'
	 *     parameters:
	 *       - name: vertexId
	 *         description: the id of the vertex
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 */
	app.get('/vertex/:vertexId', authReqMiddleware, (req: Request, res: Response) => {
		getVertexByProperty(null, 'id', req.params.vertexId, db).then((resp: any) => {
			res.send(resp);
		}).catch((err: Error) => {
			logger.error(`Error occurred at GET route /vertex/:vertexId: ${err.message}`);
			res.status(500).send(err);
		});
	});
}

export default initDbEndpoints;
