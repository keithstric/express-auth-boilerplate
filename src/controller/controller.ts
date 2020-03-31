import { Db } from 'orientjs';
import { getVertexByProperty } from '../helpers/db-helpers';
import { IVertexDocument } from '../models/Vertex';
import { IPersonDocument } from '../models/Person';
import bcrypt from 'bcrypt';

export class Controller {
	db: Db;

	constructor(db: Db) {
		if (db) {
			this.db = db;
		}else{
			throw new Error('You must provide the Database connection to Controller');
		}
	}

	/**
	 * Find a person by their email address or id
	 * @param propVal {string} an id or email address
	 * @returns {Promise<IPersonDocument>}
	 */
	findPerson(propVal: string): Promise<IPersonDocument> {
		if (this.isId(propVal)) {
			return this.findVertexByProperty('id', propVal, 'Person').then((resp: IVertexDocument) => {
				return resp as IPersonDocument;
			});
		}else if (this.isEmail(propVal)) {
			return this.findVertexByProperty('email', propVal, 'Person').then((resp: IVertexDocument) => {
				return resp as IPersonDocument;
			});
		}
	}

	/**
	 * Find a vertex by a property name and value
	 * @param propertyName {string}
	 * @param propertyValue {string|number}
	 * @return {Promise<Vertex>}
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

	/**
	 * Check if a string's pattern matches that of an email address
	 * @param val {string}
	 */
	isEmail(val: string): boolean {
		if (!val) {
			throw new Error('You must provide a value');
		}else{
			const emailRegex: RegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
			return emailRegex.test(val);
		}
	}

	/**
	 * Do a lookup to the db by email address. Then verify if the returned person id is the same as the passed in
	 * personId. If not, return a message otherwise return the IPersonDocument
	 * @param email {string}
	 * @param personId {string}
	 */
	verifyValidEmail(email: string, personId: string): Promise<IPersonDocument|{message: string, code: string}> {
		if (email && this.isEmail(email)) {
			return this.findVertexByProperty('email', email, 'Person').then((existingPerson: IPersonDocument) => {
				if (existingPerson && existingPerson.id !== personId) {
					return {
						message: `User with email address ${email} already exists!`,
						code: '01'
					};
				}
				return existingPerson;
			});
		}
	}

	/**
	 * Verify if 2 plain text passwords match
	 * @param password1 {string} unencrypted password (i.e. value of the password field)
	 * @param password2 {string} unencrypted password (i.e. value of the verify_password field)
	 */
	plainPasswordsMatch(password1: string, password2: string): boolean {
		return password1 === password2;
	}

	/**
	 * Create an encrypted password
	 * @param typedPassword {string} plain text password (i.e. value of the password field)
	 */
	createPassword(typedPassword: string) {
		if (typedPassword) {
			const salt = bcrypt.genSaltSync(13);
			return bcrypt.hashSync(typedPassword, salt);
		}
		throw new Error('Missing Parameters, typedPassword');
	}
}
