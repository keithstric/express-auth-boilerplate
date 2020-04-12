import { Db } from 'orientjs';
import {getVertexByProperty} from '../helpers/db-helpers';
import { Vertex, IVertexDocument } from '../models/Vertex';
import { Request, Response } from 'express';
import { logger } from '../config/logger/logger';
import {PersonController} from './person-controller';

export class VertexController {
	db: Db;
	vertex: Vertex;

	constructor(db: Db, vertex?: Vertex) {
		this.vertex = vertex;
		if (db) {
			this.db = db;
		}else{
			throw new Error('You must provide the Database connection to Controller');
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
			if (resp && resp['@class'] && resp['@class'] === 'Person') {
				const personController = new PersonController(this.db);
				personController.updatePerson(req, res);
			}else{
				const vertObj = Object.assign(resp, newPayload);
				const vertex = new Vertex(this.db, vertObj);
				vertex.save().then((val: IVertexDocument) => {
					if (val) {
						const updatedVertex = new Vertex(this.db, val);
						res.send(updatedVertex.toJsonString());
						logger.info(`Updated vertex with id "${vertex.id}"`);
					}
				});
			}
		});
	}

	/**
	 * Find a vertex by a property name and value
	 * @param propertyName {string}
	 * @param propertyValue {string|number}
	 * @return {Promise<Vertex>}
	 * @todo move to VertexController
	 */
	findVertexByProperty(propertyName: string, propertyVal: string|number, vertexClassname?: string): Promise<any> {
		if (propertyName && propertyVal) {
			vertexClassname = vertexClassname || 'VBase';
			return getVertexByProperty(vertexClassname, propertyName, propertyVal, this.db).then((resp: IVertexDocument) => {
				return resp;
			});
		}
		throw new Error(`Missing argument(s) propertyName = ${propertyName}, propertyValue = ${propertyVal}`);
	}

	/**
	 * Check if a string's pattern matches that of a uuid
	 * @param val {string}
	 */
	isId(val: string): boolean {
		if (!val) {
			throw new Error('You must provide a value');
		}else {
			const idRegex: RegExp = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;
			return idRegex.test(val);
		}
	}
}
