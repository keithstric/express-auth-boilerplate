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
	 * Find a person by an ID
	 * @param id {string}
	 * @return {Promise<Person>}
	 */
	findPersonById(id: string): Promise<IPersonDocument> {
		if (id) {
			return this._findPerson('id', id);
		}
		throw new Error('You must provide an id');
	}

	/**
	 * Find a person by an email address
	 * @param id {string}
	 * @return {Promise<Person>}
	 */
	findPersonByEmail(email: string): Promise<IPersonDocument> {
		if (email) {
			return this._findPerson('email', email.toLowerCase());
		}
		throw new Error('You must provide an email address');
	}

	/**
	 * Find a person by a property name and value
	 * @param propertyName {string}
	 * @param propertyValue {string|number}
	 * @return {Promise<Person>}
	 */
	private _findPerson(propertyName: string, propertyValue: string|number): Promise<IPersonDocument> {
		return super.findVertexByProperty(propertyName, propertyValue, 'Person');
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
	 * Compare the typedPassword with the hashed password
	 * @param typedPassword {string}
	 * @return {boolean}
	 */
	comparePassword(typedPassword: string): boolean {
		if (typedPassword) {
			return bcrypt.compareSync(typedPassword, this.password);
		}
		throw new Error('You must provide a typedPassword to compare with');
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
