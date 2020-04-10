/**
 * The model for a person from the orientdb instance. This file is not needed if this project
 * is being used JUST for Domino Authentication
 */

import { Db } from 'orientjs';
import bcrypt from 'bcrypt';
import { IVertexDocument, Vertex } from './Vertex';
/**
 * Interface for a Person. This should be the structure received from Orient DB for a Person
 */
export interface IPersonDocument extends IVertexDocument {
	email: string;
	first_name: string;
	last_name: string;
	password: string;
}
/**
 * The Person class
 * @class {Person}
 */
export class Person extends Vertex implements IPersonDocument {
	email: string;
	first_name: string;
	last_name: string;
	password: string;

	/**
	 * Create a new instance of the Person class
	 * @param db {Db}
	 * @param apiObj {IPersonDocument}
	 * @constructor
	 */
	constructor(db: Db, apiObj?: IPersonDocument) {
		super(db, apiObj);
	}

	/**
	 * Convert a Vertex to a Person
	 * @param vertex {Vertex}
	 */
	convertFromVertex(vertex: Vertex) {
		if (vertex) {
			Object.assign(this, vertex);
		}
		return this;
	}

	/**
	 * Save this model to the db
	 * @return {Promise<Person>}
	 */
	save(): Promise<Person|Error> {
		return new Promise((resolve: any, reject: any) => {
			super.save('Person').then((value: Vertex) => {
				if (value) {
					resolve(this.convertFromVertex(this._initObject(value)));
				}else{
					reject(new Error('Error Occurred saving Person'));
				}
			}).catch((err: Error) =>{
				reject(err);
			});
		});
	}
}
