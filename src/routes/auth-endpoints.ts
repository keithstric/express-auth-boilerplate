/**
 * This file sets up all the user authentication/registration/logout routes
 * @exports initClientEndpoints
 */
import { Application, Request, Response, NextFunction } from 'express';
import { Db } from 'orientjs';
import passport from 'passport';
import { createVertex, getVertexByProperty, createPassword } from '../helpers/db-helpers';
import { PersonDocument } from '../models/Person';
import { logger } from '../config/logger';
import authReqMiddleware from '../config/restrict-path';

const initAuthEndpoints = (app: Application, db: Db) => {
	/**
	 * @swagger
	 * /login:
	 *   post:
	 *     tags:
	 *       - authentication
	 *     description: Authentication via passport.authenticate, calls passport middleware. Callback executed if authentication is successful
	 *     responses:
	 *       200:
	 *         description: JSON object containing a message or Person
	 *         content:
	 *           application/json:
	 *             schema:
	 *               oneOf:
	 *                 - $ref: '#/components/responses/Person'
	 *                 - $ref: '#/components/responses/Message'
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
		passport.authenticate('local', (err: Error, user: PersonDocument, info: any) => {
			if (err) {
				return next(err);
			}
			if (user) {
				req.logIn(user, (err: Error) => {
					if (err) {
						return next(err);
					}
					const {first_name, last_name, email} = user;
					logger.info(`Logged In: ${first_name} ${last_name}: <${email}>`);
					return res.send(user);
				});
			}else{
				return res.send(info);
			}
		})(req, res, next);
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
	 *                 description: User's password
	 *                 type: string
	 */
	app.post('/register', (req: Request, res: Response) => {
		// TODO: This should actually be moved to a controller or something similar
		const {first_name, last_name, email, password, verify_password} = req.body;
		const name = `${first_name} ${last_name}: <${email}>`;
		getVertexByProperty('Person', 'email', email.toLowerCase(), db).then((existingPerson: PersonDocument) => {
			return existingPerson;
		}).then((existingPerson: PersonDocument) => {
			if (!existingPerson) {
				if (password !== verify_password) {
					throw new Error('Passwords do not match');
				}else {
					const hashedPassword = createPassword(password);
					const newPerson: PersonDocument = {
						first_name,
						last_name,
						email,
						password: hashedPassword,
						uuid: db.rawExpression('format("%s", uuid())')
					};
					return newPerson;
				}
			}else{
				throw new Error(`User with email ${existingPerson.email} already exists!`);
			}
		}).then((newPerson: PersonDocument) => {
			createVertex('Person', newPerson, db).then((personVertex: PersonDocument) => {
				if (personVertex) {
					logger.info(`Person vertex created for ${name} with uuid: ${personVertex.uuid}`);
					req.login(personVertex, (err) => {
						if (err) {
							throw err;
						}
						res.send(personVertex);
					});
				}else {
					res.status(400).send(new Error('No result from user creation'));
				}
			}).catch((err: Error) => {
				logger.error('Error Occurred at POST route /register: %s', err.message);
				res.status(500).send(err);
			}).finally(() => {
				logger.info(`Registered User: ${name}`);
			});
			return false; // Prevent Bluebird error: "Warning: a promise was created in a handler but was not returned from it"
		}).catch((err: Error) => {
			if (err && err.message === `User with email ${email} already exists!`) {
				res.send({"message": err.message});
			}else if (err && err.message === 'Passwords do not match') {
				res.send({"message": err.message});
			}else{
				logger.error('Error Occurred at POST route /register: %s', err.message);
				res.status(500).send(err);
			}
		});
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
		const {first_name, last_name, email} = req.user;
		req.logout();
		req.session.destroy((err) => {
			if (err) {
				return res.status(500).send(err);
			}
			res.clearCookie(process.env.WEB_SESS_NAME);
			logger.info(`Logged Out: ${first_name} ${last_name}: <${email}>`);
			res.send({message: 'success'});
		});
	});
}

export default initAuthEndpoints;
