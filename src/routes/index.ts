/**
 * This file is for setting up all application route endpoints
 */
import { Application } from 'express';
import { Db } from 'orientjs';
import initAuthEndpoints from './auth-endpoints';
import initSystemEndpoints from './system-endpoints';
import initDbEndpoints from './db-endpoints';

const initEndpoints = (app: Application, db: Db, logger: any) => {
	initSystemEndpoints(app, logger);
	initAuthEndpoints(app, db);
	initDbEndpoints(app, db);
};

export default initEndpoints;
