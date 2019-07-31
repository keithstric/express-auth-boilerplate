import { Db } from 'orientjs';

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

export class Vertex implements IVertexDocument {
	'@class'?: string;
	'@fieldTypes'?: string;
	'@rid'?: string;
	'@type'?: string;
	'@version'?: number;
	created_date?: string;
	id?: string;
	db?: Db;

	constructor(db: Db) {
		if (db) {
			this.db = db;
		}else{
			throw new Error('You must provide a Db');
		}
	}
}
