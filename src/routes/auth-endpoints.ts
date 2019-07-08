/**
 * This file sets up all the user authentication routes
 * @exports initClientEndpoints
 */
import { Application, Request, Response, NextFunction } from 'express';
import { Db } from 'orientjs';
import { createVertex, getVertexByProperty, createPassword } from '../helpers/db-helpers';
import { PersonDocument } from '../models/Person';
import passport from 'passport';
import { logger } from '../config/logger';

const initAuthEndpoints = (app: Application, db: Db) => {
	/**
	 * @swagger
	 * definitions:
	 *   Person:
	 *     type: object
	 *     properties:
	 *       first_name:
	 *         type: string
	 *       last_name:
	 *         type: string
	 *       email:
	 *         type: string
	 *       password:
	 *         type: string
	 */

	/**
	 * @swagger
	 * tags:
	 *   - name: default
	 *   - name: authentication
	 *     description: The Registration and Login process
	 */

	/**
	 * Route Middleware to redirect to the login page if there isn't an established session
	 * @param req {Request}
	 * @param res {Response}
	 * @param next {Function}
	 */
	const authReqMiddleware = (req: Request, res: Response, next: NextFunction) => {
		// console.log('authReqMiddleware, req.user=', req.user);
		// console.log('authReqMiddleware, req.isAuthenticated=', req.isAuthenticated());
		if (!req.isAuthenticated()) {
			// console.log('redirectLogin route middleware, No user, redirecting to login');
			res.redirect('/login');
		}else {
			next();
		}
	};
	/**
	 * Route Middleware to redirect to the home page if there is an established session.
	 * Should only be used for the GET /login route
	 * @param req {Request}
	 * @param res {Response}
	 * @param next {Function}
	 */
	const redirectLoginHome = (req: Request, res: Response, next: NextFunction) => {
		if (req.isAuthenticated()) {
			res.redirect('/home');
		}else {
			next();
		}
	};

	app.get('/home', authReqMiddleware, (req: Request, res: Response) => {
		res.send('<h1>Home Page</h1>');
	});
	/**
	 * @swagger
	 * /login:
	 *   get:
	 *     tags:
	 *       - authentication
	 *     description: Displays the login page
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: Login page
	 */
	app.get('/login', redirectLoginHome, (req: Request, res: Response) => {
		res.send('<h1>Login Page</h1>');
	});
	/**
	 * @swagger
	 * /login:
	 *   post:
	 *     tags:
	 *       - authentication
	 *     description: This will check that the email address exists and that the passwords match and login to the app
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: login
	 *         content:
	 *           text/html
	 *     parameters:
	 *       - name: email
	 *         description: User's email address
	 *         in: formData
	 *         required: true
	 *         type: string
	 *       - name: password
	 *         description: User's password
	 *         in: formData
	 *         required: true
	 *         type: string
	 */
	app.post('/login', passport.authenticate('local', {
		successRedirect: '/home',
		failureRedirect: '/login',
		failureFlash: true
	}));
	/**
	 * @swagger
	 * /register:
	 *   get:
	 *     tags:
	 *       - authentication
	 *     description: Displays the registration page
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: Registration Page
	 */
	app.get('/register', redirectLoginHome, (req: Request, res: Response) => {
		res.send('<h1>Registration Page</h1>');
	});
	/**
	 * @swagger
	 * /register:
	 *   post:
	 *     tags:
	 *       - authentication
	 *     description: register a user
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: register
	 *         content:
	 *           text/html
	 *     parameters:
	 *       - name: first_name
	 *         description: First Name
	 *         in: formData
	 *         required: true
	 *         type: string
	 *       - name: last_name
	 *         description: Last Name
	 *         in: formData
	 *         required: true
	 *         type: string
	 *       - name: email
	 *         description: User's email address
	 *         in: formData
	 *         required: true
	 *         type: string
	 *       - name: password
	 *         description: User's password
	 *         in: formData
	 *         required: true
	 *         type: string
	 *       - name: verify_password
	 *         description: Verify the password password
	 *         in: formData
	 *         required: true
	 *         type: string
	 */
	app.post('/register', (req: Request, res: Response) => {
		// TODO: This should actually be moved to a controller or something similar
		const {first_name, last_name, email, password, verify_password} = req.body;
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
					logger.info('Created person: %s with email %s', personVertex.first_name + ' ' + personVertex.last_name, personVertex.email);
					req.login(personVertex.uuid, (err) => {
						if (err) {
							throw err;
						}
						res.redirect('/home');
					});
				}else {
					res.status(400).send(new Error('No result from user creation'));
				}
			}).catch((err: Error) => {
				logger.error('Error Occurred at POST route /register: %s', err.message);
				res.status(500).send(err);
			});
			return false; // Prevent Bluebird error: "Warning: a promise was created in a handler but was not returned from it"
		}).catch((err: Error) => {
			if (err && err.message === `User with email ${email} already exists!`) {
				res.redirect('/login');
			}else if (err && err.message === 'Passwords do not match') {
				res.send(err.message);
			}else{
				logger.error('Error Occurred at POST route /register: %s', err.message);
				res.status(500).send(err);
			}
		});
	});
	/**
	 * @swagger
	 * /logout:
	 *   post:
	 *     tags:
	 *       - authentication
	 *     description: Logout the user, destroy the session, clear the cookie and redirect to login
	 *     produces:
	 *       text/html
	 *     responses:
	 *       200:
	 *         description: logout
	 *         content:
	 *           text/html
	 */
	app.post('/logout', authReqMiddleware, (req: Request, res: Response) => {
		req.logout();
		req.session.destroy((err) => {
			if (err) {
				return res.redirect('/home');
			}
			res.clearCookie(process.env.WEB_SESS_NAME);
			res.redirect('/login');
		});
	});
}

export default initAuthEndpoints;
