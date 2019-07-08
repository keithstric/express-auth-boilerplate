import { Db } from 'orientjs';
import bcrypt from 'bcrypt';

export const getVertexByProperty = (vertexClassName: string, propertyName: string, value: string|number, db: Db) => {
	if (vertexClassName && propertyName && value && db) {
		const whereObj: any = {};
		whereObj[propertyName] = value;
		return db.select().from(vertexClassName).where(whereObj).one();
	}
	throw new Error('Missing Parameters');
};

export const getVerticesByType = (vertexClassName: string, db: Db) => {
	if (vertexClassName && db) {
		return db.select().from(vertexClassName).all();
	}
	throw new Error('Missing Parameters');
}

export const createPassword = (typedPassword: string) => {
	if (typedPassword) {
		const salt = bcrypt.genSaltSync(13);
		return bcrypt.hashSync(typedPassword, salt);
	}
	throw new Error('Missing Parameters');
}

export const createVertex = (vertexClass: string, payload: any, db: Db) => {
	if (vertexClass && payload && db) {
		return db.create('VERTEX', vertexClass).set(payload).one();
	}
	throw new Error('Missing Parameters');
}

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

export const updateVertex = (rid: string, payload: any, db: Db) => {
	if (rid && payload && Object.keys(payload).length > 0 && db) {
		return db.update(rid).set(payload).one();
	}
	throw new Error('Missing Parameters');
}

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
