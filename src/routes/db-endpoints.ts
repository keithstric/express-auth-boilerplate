/**
 * This file contains routes pertinent to querying the DB
 * @exports initDbEndpoints
 */
import { Application, Request, Response, NextFunction } from 'express';
import { Db } from 'orientjs';
import { logger } from '../config/logger';
import authReqMiddleware from '../config/restrict-path';
import { getVerticesByType, getVertexByProperty, getVerticesByQuery, createPassword } from '../helpers/db-helpers';
import { Person, IPersonDocument } from '../models/Person';

const initDbEndpoints = (app: Application, db: Db) => {
	/**
	 * @swagger
	 * /api/vertices:
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
	app.get('/api/vertices', authReqMiddleware, (req: Request, res: Response) => {
		getVerticesByQuery('V', req.query, db).then((resp: any) => {
			res.send(resp);
		}).catch((err: Error) => {
			logger.error(`Error occurred at GET route /api/vertices: ${err.message}`);
			res.status(500).send(err);
		});
	});
	/**
	 * @swagger
	 * /api/vertices/{vertexType}:
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
	app.get('/api/vertices/:vertexType', authReqMiddleware, (req: Request, res: Response) => {
		if (Object.keys(req.query).length === 0) {
			getVerticesByType(req.params.vertexType, db).then((resp: any[]) => {
				res.send(resp);
			}).catch((err: Error) => {
				logger.error(`Error occurred at GET route /api/vertices/${req.params.vertexType}: ${err.message}`);
				res.status(500).send(err);
			});
		}else {
			getVerticesByQuery(req.params.vertexType, req.query, db).then((resp: any) => {
				res.send(resp);
			}).catch((err: Error) => {
				logger.error(`Error occurred at GET route /api/vertices/:vertexType: ${err.message}`);
				res.status(500).send(err);
			});
		}
	});
	/**
	 * @swagger
	 * /api/vertex/{vertexId}:
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
	app.get('/api/vertex/:vertexId', authReqMiddleware, (req: Request, res: Response) => {
		getVertexByProperty(null, 'id', req.params.vertexId, db).then((resp: any) => {
			res.send(resp);
		}).catch((err: Error) => {
			logger.error(`Error occurred at GET route /vertex/:vertexId: ${err.message}`);
			res.status(500).send(err);
		});
	});
	/**
	 * @swagger
	 * /api/vertex/{vertexId}:
	 *   put:
	 *     tags:
	 *       - Db
	 *     description: Update a single Vertex's values
	 *     responses:
	 *       200:
	 *         $ref: '#/components/responses/Vertex'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *       500:
	 *         $ref: '#/components/responses/Error'
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/x-www-form-urlencoded:
	 *           schema:
	 *             type: object
	 *             additionalProperties: true
	 *     parameters:
	 *       - name: vertexId
	 *         description: the id of the vertex
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 */
	app.put('/api/vertex/:vertexId', authReqMiddleware, (req: Request, res: Response) => {
		const {vertexId} = req.params;
		if (vertexId) {
			if (req.body['@class'] === 'Person') {
				const newPayload = Object.assign({}, req.body);
				const {new_password, verify_password, email} = newPayload;
				delete newPayload.password;
				if (new_password && verify_password) {
					if (new_password !== verify_password) {
						res.send({message: 'Passwords don\'t match'});
						return;
					}else{
						const hashedPassword = createPassword(new_password);
						newPayload.password = hashedPassword;
					}
					delete newPayload.new_password;
					delete newPayload.verify_password;
				}
				const person: Person = new Person(db, newPayload);
				person.findPersonByEmail(email).then((existingPerson: IPersonDocument) => {
					if (existingPerson && existingPerson.id !== person.id) {
						res.send({
							message: `User with email address ${existingPerson.email} already exists!`,
							code: '01'
						});
						return;
					}else {
						person.save().then((updatedPerson: Person) => {
							res.send(updatedPerson.toJson());
							logger.info(`User with rid ${person['@rid']} updated their profile}`);
						}).catch((err: Error) => {
							logger.error(`Person update failed. ${err.message}`);
							res.status(500).send({message: err.message});
						});
					}
				});
			}else {
				res.send({message: 'Unknown Class provided in the body of a request'});
			}
		}
	});
}

export default initDbEndpoints;
