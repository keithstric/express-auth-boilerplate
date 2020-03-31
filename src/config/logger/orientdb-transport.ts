import {Db} from "orientjs";
import {IOrientDbLogQueryOptions, IOrientDbTransportConfig} from "../../express-auth-types";
import {createVertex} from "../../helpers/db-helpers";
import {IVertexDocument} from "../../models/Vertex";
import Transport from 'winston-transport';

export class OrientDbTransport extends Transport {
	private readonly _db: Db;

	constructor(opts: IOrientDbTransportConfig) {
		super(opts);
		this._db = opts.db;
	}

	get db(): Db {
		return this._db;
	}

	get name(): string {
		return 'OrientDbTransport';
	}

	log(info:any, next:() => void) {
		setImmediate(() => {
			this.emit('logged', info);
		});
		if (this.db) {
			const vertexType = info.request_url ? 'RequestLog' : 'Log';
			createVertex(vertexType, info, this.db);
		}
		next();
	}

	query(options: IOrientDbLogQueryOptions, callback: any) {
		let query = `SELECT * from ${options.logType} WHERE @class="${options.logType}"`;
		if (options.from) {
			const from = new Date(options.from).toISOString();
			query += ' AND timestamp';
			let until = new Date(options.until).toISOString();
			if (options.until) {
				query += ` between "${from}" and "${until}"`
			}else {
				query += `=${from}`;
			}
		}
		if(options.order) {
			query += ` ORDER BY timestamp ${options.order.toUpperCase()}`
		}
		if (options.limit > 0) {
			query += ` LIMIT ${options.limit}`;
		}
		try {
			this.db.query(query).all().then((results: IVertexDocument[]) => {
				callback(null, results);
			}).catch((e) => {
				callback(e, null);
			});
		}catch(e) {
			callback(e, null);
		}
	}
}
