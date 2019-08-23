/**
 * This file contains routes pertinent to querying the DB. This file is not needed if this project
 * is being used JUST for Domino Authentication
 * @exports initDbEndpoints
 */
import { Application, Request, Response, NextFunction } from 'express';
import { Db } from 'orientjs';
import { logger } from '../config/logger';
import authReqMiddleware from '../config/restrict-path';
import { getVerticesByType, getVertexByProperty, getVerticesByQuery, createPassword } from '../helpers/db-helpers';
import { Person, IPersonDocument } from '../models/Person';
import { Vertex } from '../models/Vertex';

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
	 *     description: Update a single Vertex's values. This requires all the properties of the vertex, not JUST the properties changed
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
			const newPayload = Object.assign({}, req.body);
			newPayload.id = newPayload.id || vertexId;
			if (req.body['@class'] === 'Person') {
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
						return person.save();
					}
				}).then((updatedPerson: Person) => {
					if (updatedPerson) {
						res.send(updatedPerson.toJson());
						logger.info(`User with ${person['@rid'] ? 'rid' : 'id'} "${person['@rid'] ? person['@rid'] : person.id}" & email "${person.email}" updated their profile}`);
					}
				}).catch((err: Error) => {
					logger.error(`User profile update failed. ${err.message}`);
					res.status(500).send({message: err.message});
				});
			}else {
				const vertex: Vertex = new Vertex(db, newPayload);
				vertex.save().then((val: any) => {
					console.log(`db-endpoints PUT /api/vertex/:vertexId, val=${JSON.stringify(val)}`);
					if (val) {
						const updatedVertex = new Vertex(db, val);
						res.send(updatedVertex.toJson());
						logger.info(`Updated vertex with id "${vertex.id}"`);
					}
				});
			}
		}
	});

	app.patch('/api/vertex/:vertexId', (req: Request, res: Response) => {
		const {vertexId} = req.params;
		if (vertexId) {

		}
	});
}

export default initDbEndpoints;
