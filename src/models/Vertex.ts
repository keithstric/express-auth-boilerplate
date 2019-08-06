import { Db } from 'orientjs';
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
	db?: Db
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
	constructor(db: Db) {
		if (db) {
			this.db = db;
		}else{
			throw new Error('You must provide a Db');
		}
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
	toJson(): string {
		const obj = this.toObject();
		return JSON.stringify(obj);
	}
}
