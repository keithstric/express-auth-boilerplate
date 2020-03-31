/**
 * This file sets up all the user authentication/registration/logout routes
 * @exports initClientEndpoints
 */
import * as path from 'path';
 import express, { Application, Request, Response, NextFunction } from 'express';
import { Db } from 'orientjs';
import { logger } from '../config/logger/logger';
import authReqMiddleware from '../config/restrict-path';
import { AuthenticationController } from '../controller/auth-controller';

const initAuthEndpoints = (app: Application, db: Db) => {
	// Required for React to locate bundles
	app.use(express.static(path.join(__dirname, '..', '..', 'client', 'build')));

	/**
	 * @swagger
	 * /login:
	 *   get:
	 *     tags:
	 *       - authentication
	 *     description: The React client login page
	 *     responses:
	 *       200:
	 *         description: OK
	 *         schema:
	 *           type: string
	 */
	app.get('/login', (req: Request, res: Response) => {
		res.sendFile(path.join(__dirname, '..', '..', 'client', 'build', 'index.html'));
	});

	/**
	 * @swagger
	 * /login:
	 *   post:
	 *     tags:
	 *       - authentication
	 *     description: Authentication via passport.authenticate, calls passport middleware. Callback executed if authentication is successful
	 *     responses:
	 *       200:
	 *         $ref: '#/components/responses/Person'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/x-www-form-urlencoded:
	 *           schema:
	 *             type: object
	 *             required: [email, password]
	 *             properties:
	 *               email:
	 *                 description: User's email address
	 *                 type: string
	 *               password:
	 *                 description: User's password
	 *                 type: string
	 */
	app.post('/login', (req: Request, res: Response, next: NextFunction) => {
		try {
			const controller = new AuthenticationController(db);
			controller.login(req, res, next);
		}catch(e) {
			logger.error(`An error occurred during login: ${e.message}`);
			console.error(e);
		}
	});

	/**
	 * @swagger
	 * /register:
	 *   post:
	 *     tags:
	 *       - authentication
	 *     description: register a user
	 *     responses:
	 *       200:
	 *         description: JSON object containing a message or Person
	 *         content:
	 *           application/json:
	 *             schema:
	 *               oneOf:
	 *                 - $ref: '#/components/responses/Person'
	 *                 - $ref: '#/components/responses/Message'
	 *       500:
	 *         $ref: '#/components/responses/Error'
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/x-www-form-urlencoded:
	 *           schema:
	 *             type: object
	 *             required: [first_name, last_name, email, password, verify_password]
	 *             properties:
	 *               first_name:
	 *                 description: First Name
	 *                 type: string
	 *               last_name:
	 *                 description: Last Name
	 *                 type: string
	 *               email:
	 *                 description: User's email address
	 *                 type: string
	 *               password:
	 *                 description: User's password
	 *                 type: string
	 *               verify_password:
	 *                 description: Verify User's password
	 *                 type: string
	 */
	app.post('/register', (req: Request, res: Response) => {
		try {
			const controller = new AuthenticationController(db);
			controller.registerPerson(req, res);
		}catch(e) {
			logger.error(`An error occurred registering a user: ${e.message}`);
			console.error(e);
		}
	});

	/**
	 * @swagger
	 * /logout:
	 *   get:
	 *     tags:
	 *       - authentication
	 *     description: Logout the user, destroy the session, clear the cookie and redirect to login
	 *     responses:
	 *       200:
	 *         $ref: '#/components/responses/Message'
	 *       401:
	 *         $ref: '#/components/responses/Message'
	 *       500:
	 *         $ref: '#/components/responses/Error'
	 */
	app.get('/logout', authReqMiddleware, (req: Request, res: Response) => {
		try {
			const controller = new AuthenticationController(db);
			controller.logout(req, res);
		}catch(e) {
			logger.error(`An error occurred during logout: ${e.message}`);
			console.error(e);
		}
	});
};

export default initAuthEndpoints;
