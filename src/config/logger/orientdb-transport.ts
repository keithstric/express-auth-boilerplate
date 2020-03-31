import {Db} from "orientjs";
import {IOrientDbLogQueryOptions, IOrientDbTransportConfig} from "../../express-auth-types";
import {createVertex} from "../../helpers/db-helpers";
import {IVertexDocument} from "../../models/Vertex";
import Transport from 'winston-transport';

/**
 * A winston logger transport for OrientDb for storing logs in Orient
 */
export class OrientDbTransport extends Transport {
	private readonly _db: Db;

	constructor(opts: IOrientDbTransportConfig) {
		super(opts);
		this._db = opts.db;
	}

	/**
	 * The OrientDb instance
	 * @returns {Db}
	 */
	get db(): Db {
		return this._db;
	}

	/**
	 * The transport name
	 * @returns {string}
	 */
	get name(): string {
		return 'OrientDbTransport';
	}

	/**
	 * Logs an entry in the log
	 * @param {any} info
	 * @param {NextFunction} next
	 */
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

	/**
	 * For query OrientDb for logs
	 * @param {IOrientDbLogQueryOptions} options
	 * @param {function} callback
	 */
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
