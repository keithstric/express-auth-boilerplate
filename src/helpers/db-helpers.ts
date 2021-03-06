/**
 * This file provides a few database helpers for getting vertices, creating vertices and edges, etc. This file is not needed if this project
 * is being used JUST for Domino Authentication
 */
import { Db } from 'orientjs';
import bcrypt from 'bcrypt';
import {IDbQuery} from '../express-auth-types';

/**
 * Get a vertex by a value in a property from orient db
 * @param vertexClassName {string}
 * @param propertyName {string}
 * @param value {string|number}
 * @param db {Db}
 * @returns {Promise<any>}
 */
export const getVertexByProperty = (vertexClassName: string, propertyName: string, value: string|number, db: Db) => {
	vertexClassName = vertexClassName || 'V';
	if (vertexClassName && propertyName && value && db) {
		const whereObj: any = {};
		whereObj[propertyName] = value;
		return db.select().from(vertexClassName).where(whereObj).one();
	}
	const argsObj = {vertexClassName: vertexClassName, propertyName: propertyName, value: value, db: db};
	const msg = _getMissingParamsMsg(argsObj);
	throw new Error(msg);
};

/**
 * Get an array of vertex types
 * @param vertexClassName {string}
 * @param db {Db}
 * @returns {Promise<any[]>}
 */
export const getVerticesByType = (vertexClassName: string, db: Db) => {
	if (vertexClassName && db) {
		return db.select().from(vertexClassName).all();
	}
	const argsObj = {vertexClassName: vertexClassName, db: db};
	const msg = _getMissingParamsMsg(argsObj);
	throw new Error(msg);
}

/**
 * Perform a query against the DB
 * @param vertexClassName {string}
 * @param queryObj {IDbQuery}
 * @param db {Db}
 * @returns {Promise<any[]>}
 */
export const getVerticesByQueryObj = (vertexClassName: string, queryObj: IDbQuery, db: Db) => {
	if (vertexClassName && queryObj && db) {
		let query = `select from ${vertexClassName}`;
		Object.keys(queryObj).forEach((key: string, idx: number) => {
			if (key !== 'queryOperator') {
				const keyVal = queryObj[key];
				if (idx === 0) {
					query += ` where ${key} ${queryObj.queryOperator} "${keyVal}"`;
				}else{
					query += ` and ${key} ${queryObj.queryOperator} "${keyVal}"`;
				}
			}
		});
		console.log('getVerticesByQuery, query=', query);
		return db.query(query).all();
	}
	const argsObj = {vertexClassName: vertexClassName, queryObj: queryObj, db: db};
	const msg = _getMissingParamsMsg(argsObj);
	throw new Error(msg);
}

/**
 * Create a hashed password from the passed in password using bcrypt
 * @param typedPassword {string}
 * @returns {string}
 */
export const createPassword = (typedPassword: string) => {
	if (typedPassword) {
		const salt = bcrypt.genSaltSync(13);
		return bcrypt.hashSync(typedPassword, salt);
	}
	throw new Error('Missing Parameters, typedPassword');
}

/**
 * Create a vertex in orientDb
 * @param vertexClass {String}
 * @param payload {any}
 * @param db {Db}
 * @returns {Promise<any>}
 */
export const createVertex = (vertexClass: string, payload: any, db: Db): Promise<any> => {
	if (vertexClass && payload && db) {
		return db.create('VERTEX', vertexClass).set(payload).one();
	}
	const argsObj = {vertexClass: vertexClass, payload: payload, db: db};
	const msg = _getMissingParamsMsg(argsObj);
	throw new Error(msg);
}

/**
 * Create an edge between 2 vertices
 * @param label {string}
 * @param fromRid {string}
 * @param toRid {string}
 * @param db {Db}
 * @param payload {any}
 * @returns {Promise<any>}
 */
export const createEdge = (label: string, fromRid: string, toRid: string, db: Db, payload?: any): Promise<any> => {
	if (label && fromRid && toRid && db) {
		if (!payload) {
			return db.create('EDGE', label).from(fromRid).to(toRid).one();
		}else {
			return db.create('EDGE', label).from(fromRid).to(toRid).set(payload).one();
		}
	}
	const argsObj = {label: label, fromRid: fromRid, toRid: toRid, db: db};
	const msg = _getMissingParamsMsg(argsObj);
	throw new Error(msg);
};

/**
 * Update property values in a vertex
 * @param rid {string}
 * @param payload {any}
 * @param db {Db}
 * @returns {Promise<any>}
 */
export const updateVertex = (rid: string, payload: any, db: Db): Promise<any> => {
	if (payload && Object.keys(payload).length > 0) {
		const protectedFields = ['id', 'created_date', 'db'];
		Object.keys(payload).forEach((key: string) => {
			if (key.startsWith('@') || key.startsWith('#') || protectedFields.indexOf(key) > -1) {
				delete payload[key];
			}
		});
	}
	if (rid && rid.startsWith('#') && payload && Object.keys(payload).length > 0 && db) {
		return db.update(rid).set(payload).one(); // must use rid
	}else if (rid && !rid.startsWith('#') && payload && Object.keys(payload).length > 0 && db) {
		const vertexClass = payload['@class'] || 'VBase';
		return getVertexByProperty(vertexClass, 'id', rid, db).then((resp: any) => {
			return db.update(resp['@rid']).set(payload).one();
		});
	}
	const argsObj = {rid: rid, payload: payload, db: db};
	const msg = _getMissingParamsMsg(argsObj);
	throw new Error(msg);
};

/**
 * Get the vertex IDs for a label
 * @param vertex {any}
 * @param label {string}
 * @return {string[]}
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
	const argsObj = {vertex: vertex, label: label};
	const msg = _getMissingParamsMsg(argsObj);
	throw new Error(msg);
};

const _getMissingParamsMsg = (paramsObj: any) => {
	let msg = 'Missing Parameters';
	if (paramsObj) {
		const args = Object.keys(paramsObj);
		const missingArgs: string[] = [];
		args.forEach((arg: string) => {
			if (!paramsObj[arg]) {
				missingArgs.push(arg);
			}
		});
		if (missingArgs.length > 0) {
			msg += `, ${missingArgs.join(',')}`
		}
	}
	return msg;
};
