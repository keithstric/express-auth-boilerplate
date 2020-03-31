/**
 * The model for a Vertex from the orientdb instance. This file is not needed if this project
 * is being used JUST for Domino Authentication
 */
import { Db } from 'orientjs';
import { getVertexByProperty } from '../helpers/db-helpers';
import { updateVertex } from '../helpers/db-helpers';
import { createVertex } from '../helpers/db-helpers';
/**
 * Interface for a vertex. This represents the structure received from OrientDb for any type of Vertex
 */
export interface IVertexDocument {
	'@class'?: string;
	'@fieldTypes'?: string;
	'@rid'?: string;
	'@type'?: string;
	'@version'?: number;
	created_date?: string;
	id?: string;
	db?: Db;
	[x: string]: any;
}

/**
 * The Vertex class
 * @class {Vertex}
 */
export class Vertex implements IVertexDocument {
	'@class'?: string;
	'@fieldTypes'?: string;
	'@rid'?: string;
	'@type'?: string;
	'@version'?: number;
	created_date?: string;
	id?: string;
	db?: Db;

	/**
	 * Create a new instance of the Vertex class
	 * @param db {Db}
	 * @constructor
	 */
	constructor(db: Db, apiObj?: any) {
		if (db) {
			this.db = db;
			if (apiObj) {
				this._initObject(apiObj);
			}
		}else{
			throw new Error('You must provide a Db');
		}
	}

	/**
	 * Populate the properties of this class with the properties from orientDb
	 * @param apiObj {IVertexDocument}
	 */
	protected _initObject(apiObj: IVertexDocument): Vertex {
		if (apiObj) {
			Object.assign(this, apiObj);
		}
		return this;
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
	 * Get an object representing this class instance
	 * @return {IPersonDocument}
	 */
	toObject(): IVertexDocument {
		const obj: any = {...this};
		const removeKeys = ['db']
		Object.keys(obj).forEach((key: string) => {
			if (removeKeys.indexOf(key) > -1) {
				delete obj[key];
			}
		});
		return obj;
	}

	/**
	 * Get a JSON string representing this class instance
	 * @return {string};
	 */
	toJsonString(): string {
		const obj = this.toObject();
		return JSON.stringify(obj);
	}

	/**
	 * Save this model to the db
	 * @return {Promise<Person>}
	 */
	save(vertexClass?: string): Promise<any> {
		if (this.id) {
			const useId = this.id;
			return updateVertex(useId, this.toObject(), this.db).then((updateCount: number) => {
				return this.toObject();
			});
		}else {
			vertexClass = vertexClass || 'VBase';
			return createVertex(vertexClass, this.toObject(), this.db).then((vertexResp: IVertexDocument) => {
				this._initObject(vertexResp);
				return this;
			});
		}
	}
}
