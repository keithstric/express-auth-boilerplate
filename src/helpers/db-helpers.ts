/**
 * This file provides a few database helpers for getting vertices, creating vertices and edges, etc.
 */
import { Db } from 'orientjs';
import bcrypt from 'bcrypt';
/**
 * Get a vertex by a value in a property from orient db
 * @param vertexClassName {string}
 * @param propertyName {string}
 * @param value {string|number}
 * @param db {Db}
 */
export const getVertexByProperty = (vertexClassName: string, propertyName: string, value: string|number, db: Db) => {
	if (vertexClassName && propertyName && value && db) {
		const whereObj: any = {};
		whereObj[propertyName] = value;
		return db.select().from(vertexClassName).where(whereObj).one();
	}
	throw new Error('Missing Parameters');
};
/**
 * Get an array of vertex types
 * @param vertexClassName {string}
 * @param db {Db}
 */
export const getVerticesByType = (vertexClassName: string, db: Db) => {
	if (vertexClassName && db) {
		return db.select().from(vertexClassName).all();
	}
	throw new Error('Missing Parameters');
}
/**
 * Create a hashed password from the passed in password using bcrypt
 * @param typedPassword {string}
 */
export const createPassword = (typedPassword: string) => {
	if (typedPassword) {
		const salt = bcrypt.genSaltSync(13);
		return bcrypt.hashSync(typedPassword, salt);
	}
	throw new Error('Missing Parameters');
}
/**
 * Create a vertex in orientDb
 * @param vertexClass {String}
 * @param payload {any}
 * @param db {Db}
 */
export const createVertex = (vertexClass: string, payload: any, db: Db) => {
	if (vertexClass && payload && db) {
		return db.create('VERTEX', vertexClass).set(payload).one();
	}
	throw new Error('Missing Parameters');
}
/**
 * Create an edge between 2 vertices
 * @param label {string}
 * @param fromRid {string}
 * @param toRid {string}
 * @param db {Db}
 * @param payload {any}
 */
export const createEdge = (label: string, fromRid: string, toRid: string, db: Db, payload?: any) => {
	if (label && fromRid && toRid && db) {
		if (!payload) {
			return db.create('EDGE', label).from(fromRid).to(toRid).one();
		}else {
			return db.create('EDGE', label).from(fromRid).to(toRid).set(payload).one();
		}
	}
	throw new Error('Missing Parameters');
}
/**
 * Update property values in a vertex
 * @param rid {string}
 * @param payload {any}
 * @param db {Db}
 */
export const updateVertex = (rid: string, payload: any, db: Db) => {
	if (rid && payload && Object.keys(payload).length > 0 && db) {
		return db.update(rid).set(payload).one();
	}
	throw new Error('Missing Parameters');
}
/**
 * Get the verex IDs for a label
 * @param vertex {any}
 * @param label {string}
 */
export const getVertexEdges = (vertex: any, label: string): string[] => {
	if (vertex && label) {
		const outLabelName = 'out_' + label;
		const outVal = vertex[outLabelName];
		let idArr: string[] = [];
		if (outVal && outVal.length > 0) {
			idArr = idArr.concat(outVal);
		}
		const inLabelName = 'in_' + label;
		const inVal = vertex[inLabelName];
		if (inVal && inVal.length > 0) {
			idArr = idArr.concat(inVal);
		}
		return idArr;
	}
	throw new Error('Missing Parameters');
}
