import { Db } from 'orientjs';
import { getVertexByProperty, createVertex } from '../helpers/db-helpers';
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
	exists: boolean = false;
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
	findPersonById(id: string): Promise<Person> {
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
	findPersonByEmail(email: string): Promise<Person> {
		if (email) {
			return this._findPerson('email', email);
		}
		throw new Error('You must provide an email address');
	}
	/**
	 * Find a person by a property name and value
	 * @param propertyName {string}
	 * @param propertyValue {string|number}
	 * @return {Promise<Person>}
	 */
	private _findPerson(propertyName: string, propertyValue: string|number): Promise<Person> {
		if (propertyName && propertyValue) {
			return getVertexByProperty('Person', propertyName, propertyValue, this.db).then((personObj: IPersonDocument) => {
				if (personObj) {
					this.exists = true;
					this._initObject(personObj);
					return this;
				}else {
					this.exists = false;
				}
			});
		}
	}
	/**
	 * Populate the properties of this class with the properties from orientDb
	 * @param apiObj {IPersonDocument}
	 */
	private _initObject(apiObj: IPersonDocument): Person {
		if (apiObj) {
			this.exists = apiObj.id ? true : false;
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
	 * Get an object representing this class instance
	 * @return {IPersonDocument}
	 */
	toObject(): IPersonDocument {
		const obj = {...this};
		delete obj.db;
		delete obj.exists;
		return obj;
	}
	/**
	 * Save this model to the db
	 * @return {Promise<Person>}
	 */
	save(): Promise<Person> {
		if (this.id) {

		}else {
			return createVertex('Person', this.toObject(), this.db).then((personResp: IPersonDocument) => {
				this._initObject(personResp);
				return this;
			});
		}
	}
}
