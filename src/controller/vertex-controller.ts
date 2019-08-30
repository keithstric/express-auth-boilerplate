import { Db } from 'orientjs';
import { Vertex, IVertexDocument } from '../models/Vertex';
import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { Controller } from './controller';

export class VertexController extends Controller {
	db: Db;

	constructor(db: Db, vertex?: Vertex) {
		super(db);
		if (db) {
			this.db = db;
		}else{
			throw new Error('You must provide the Database connection to VertexController');
		}
	}
	/**
	 * Update the values of a vertex
	 * @param req {Request}
	 * @param res {Response}
	 */
	updateVertex(req: Request, res: Response) {
		const newPayload = Object.assign({}, req.body);
		newPayload.id = req.params.vertexId;
		this.findVertexByProperty('id', newPayload.id).then((resp: IVertexDocument) => {
			/**
			 * TODO: We need to check if the resp is a Person vertex, if it is and email is a property of newPayload
			 * then we need to verify that the person isn't changing the email address to an address that is in use elsewhere
			 * TODO: We need to also be able to update the password.
			 *
			 * The problem is, these methods are in another controller and it's a general rule that controllers don't invoke
			 * one another, so not quite sure where to define this functionality. I could of course move the functionality
			 * up into the "Controller" class since all controllers should extend the "Controller" class.
			 */
			const vertObj = Object.assign(resp, newPayload);
			const vertex = new Vertex(this.db, vertObj);
			vertex.save().then((val: IVertexDocument) => {
				if (val) {
					const updatedVertex = new Vertex(this.db, val);
					res.send(updatedVertex.toJson());
					logger.info(`Updated vertex with id "${vertex.id}"`);
				}
			});
		});
	}
}
