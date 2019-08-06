import { Db } from 'orientjs';
import { getVertexByProperty, createVertex, updateVertex } from '../helpers/db-helpers';
import bcrypt from 'bcrypt';
import { IVertexDocument, Vertex } from './Vertex';
/**
 * Interface for a Person. This should be the structure received from Orient DB for a Person
 */
export interface IPersonDocument extends IVertexDocument {
	password: string;
	last_name: string;
	first_name: string;
	email: string;
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
		super(db);
		if (db) {
			if (apiObj) {
				this._initObject(apiObj);
			}
		}else{
			throw new Error('You must provide a Db');
		}
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
		if (propertyName && propertyValue) {
			return getVertexByProperty('Person', propertyName, propertyValue, this.db).then((resp: any) => {
				return resp;
			});
		}
		throw new Error(`Missing argument(s) propertyName = ${propertyName}, propertyValue = ${propertyValue}`);
	}
	/**
	 * Populate the properties of this class with the properties from orientDb
	 * @param apiObj {IPersonDocument}
	 */
	private _initObject(apiObj: IPersonDocument): Person {
		if (apiObj) {
			Object.assign(this, apiObj);
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
	save(): Promise<Person> {
		if (this.id) {
			return updateVertex(this['@rid'], this.toObject(), this.db).then((updateCount: number) => {
				return this;
			});
		}else {
			return createVertex('Person', this.toObject(), this.db).then((personResp: IPersonDocument) => {
				this._initObject(personResp);
				return this;
			});
		}
	}
}
