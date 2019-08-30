import { Db } from 'orientjs';
import { getVertexByProperty } from '../helpers/db-helpers';
import { IVertexDocument } from '../models/Vertex';
import { IPersonDocument } from '../models/Person';
import { PersonController } from './person-controller';
import { VertexController } from './vertex-controller';
import { AuthenticationController } from './auth-controller';

export enum ControllerTypes {
	PERSON = 'person',
	VERTEX = 'vertex',
	AUTHENTICATION = 'authentication'
}

export class Controller {
	db: Db;

	constructor(db: Db) {
		if (db) {
			this.db = db;
		}else{
			throw new Error('You must provide the Database connection to Controller');
		}
	}

	getController(type: ControllerTypes, obj?: any): PersonController|VertexController|AuthenticationController|Controller {
		switch (type) {
			case ControllerTypes.PERSON:
				return new PersonController(this.db, obj);
				break;
			case ControllerTypes.VERTEX:
				return new VertexController(this.db, obj);
				break;
			case ControllerTypes.AUTHENTICATION:
				return new AuthenticationController(this.db);
				break;
		}
		return this;
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
		if (val) {
			throw new Error('You must provide a value');
		}else{
			const emailRegex: RegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
			return emailRegex.test(val);
		}
	}
}
