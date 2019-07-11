/**
 * This file sets up the database connection
 */
import OrientDBClient, { ServerConfig } from 'orientjs';

const getDbConn = () => {
	const dbPort: number = parseInt(process.env.DB_PORT);
	const orientServerConfig: ServerConfig = {
		host: process.env.DB_HOST,
		port: dbPort,
		username: process.env.DB_ROOT_USER,
		password: process.env.DB_ROOT_PASSWORD,
	};
	const orientClientDbConfig: OrientDBClient.DbConfig = {
		name: process.env.DB_NAME,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD
	};
	const orientClient: OrientDBClient.Server = OrientDBClient(orientServerConfig);
	const db = orientClient.use(orientClientDbConfig);
	return db;
}

export default getDbConn;
