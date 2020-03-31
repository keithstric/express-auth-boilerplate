import { IPersonDocument, Person } from '../models/Person';
import { Db } from 'orientjs';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger/logger';
import passport from 'passport';
import { Controller } from './controller';

export class AuthenticationController extends Controller {
	db: Db;

	constructor(db: Db) {
		super(db);
		if (db) {
			this.db = db;
		}else{
			throw new Error('You must provide the Database connection to AuthenticationController');
		}
	}
	/**
	 * Login a user and send the user object
	 * @param req {Reqeust}
	 * @param res {Response}
	 * @param next {NextFunction}
	 * @method {POST}
	 */
	login(req: Request, res: Response, next: NextFunction) {
		passport.authenticate('local', (err: Error, user: Person, info: any) => {
			if (err) {
				return next(err);
			}
			if (user) {
				const userObj = user.toObject();
				req.logIn(userObj, (err: Error) => {
					if (err) {
						return next(err);
					}
					const {first_name, last_name, email} = userObj;
					logger.info(`Logged In: ${first_name} ${last_name}: <${email}>`);
					return res.send(userObj);
				});
			}else{
				return res.status(401).send(info);
			}
		})(req, res, next);
	}
	/**
	 * Register a person and send the IPersonDocument or an error message
	 * @param req {Request}
	 * @param res {Response}
	 * @method {POST}
	 */
	registerPerson(req: Request, res: Response) {
		const {first_name, last_name, email, password, verify_password} = req.body;
		const displayName = `${first_name} ${last_name}: <${email}>`;
		const hashedPassword = this.createPassword(password);
		const person = new Person(this.db, {
			first_name,
			last_name,
			email: email ? email.toLowerCase() : email,
			password: hashedPassword
		});
		if (!this.plainPasswordsMatch(password, verify_password)) {
			res.status(400).send({message: 'Passwords don\'t match'});
		}else {
			person.findPersonByEmail(email.toLowerCase()).then((personDoc: IPersonDocument) => {
				const existingPerson = personDoc ? new Person(this.db, personDoc) : undefined;
				if (!existingPerson) {
					return person.save();
				}else{
					res.status(400).send({
						message: `User with email address ${existingPerson.email} already exists!`,
						code: '01'
					});
				}
			}).then((savedPerson: Person) => {
				if (savedPerson) {
					logger.info(`Person vertex created for ${displayName} with id: ${savedPerson.id}`);
					req.login(savedPerson, (err) => {
						if (err) {
							throw err;
						}
						res.send(savedPerson.toObject());
						logger.info(`Registered User: ${displayName} with id ${savedPerson.id}`);
					});
				}else {
					res.status(400).send(new Error('No result from user creation for ${displayName} with email ${email}'));
				}
			}).catch((err: Error) => {
				logger.error(`Error Occurred at POST route /register: ${err.message}`);
				res.status(500).send(err);
			});
		}
	}
	/**
	 * Logout a user and redirect to the login page
	 * @param req {Request}
	 * @param res {Response}
	 * @method {GET}
	 */
	logout(req: Request, res: Response) {
		const {first_name, last_name, email} = req.user;
		req.logout();
		req.session.destroy((err) => {
			if (err) {
				return res.status(500).send(err);
			}
			res.clearCookie(process.env.WEB_SESS_NAME);
			logger.info(`Logged Out: ${first_name} ${last_name}: <${email}>`);
			res.redirect('/login');
		});
	}
}
