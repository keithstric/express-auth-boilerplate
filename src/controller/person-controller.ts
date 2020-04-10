import bcrypt from 'bcrypt';
import passport from 'passport';
import { Person, IPersonDocument } from '../models/Person';
import { Db } from 'orientjs';
import {NextFunction, Request, Response} from 'express';
import { logger } from '../config/logger/logger';
import { VertexController } from './vertex-controller';

export class PersonController extends VertexController {
	person: Person;
	db: Db;

	constructor(db: Db, person?: Person) {
		super(db, person);
		this.person = person;
	}

	/**
	 * Compare the typedPassword with the hashed password
	 * @param typedPassword {string}
	 * @return {boolean}
	 */
	comparePassword(typedPassword: string): boolean {
		if (typedPassword && this.person) {
			return bcrypt.compareSync(typedPassword, this.person.password);
		}
		const errorMsg = !typedPassword ? 'You must provide a typedPassword to compare with' : 'No person provided';
		throw new Error(errorMsg);
	}

	/**
	 * Find a person by a property name and value
	 * @param propertyName {string}
	 * @param propertyValue {string|number}
	 * @return {Promise<Person>}
	 */
	private _findPerson(propertyName: string, propertyValue: string|number): Promise<IPersonDocument> {
		return super.findVertexByProperty(propertyName, propertyValue, 'Person');
	}

	/**
	 * Find a person by an email address
	 * @param id {string}
	 * @return {Promise<Person>}
	 */
	findPersonByEmail(email: string): Promise<IPersonDocument> {
		if (email) {
			return this._findPerson('email', email.toLowerCase());
		}
		throw new Error('You must provide an email address');
	}

	/**
	 * Find a person by an ID
	 * @param id {string}
	 * @return {Promise<Person>}
	 */
	findPersonById(id: string): Promise<IPersonDocument> {
		if (id) {
			return this._findPerson('id', id);
		}
		throw new Error('You must provide an id');
	}

	/**
	 * Check if a string's pattern matches that of an email address
	 * @param val {string}
	 */
	isEmail(val: string): boolean {
		if (!val) {
			throw new Error('You must provide a value');
		}else{
			const emailRegex: RegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
			return emailRegex.test(val);
		}
	}

	/**
	 * Do a lookup to the db by email address. Then verify if the returned person id is the same as the passed in
	 * personId. If not, return a message otherwise return the IPersonDocument
	 * @param email {string}
	 * @param personId {string}
	 */
	verifyValidEmail(email: string, personId: string): Promise<IPersonDocument|{message: string, code: string}> {
		if (email && this.isEmail(email)) {
			return this.findVertexByProperty('email', email, 'Person').then((existingPerson: IPersonDocument) => {
				if (existingPerson && existingPerson.id !== personId) {
					return {
						message: `User with email address ${email} already exists!`,
						code: '01'
					};
				}
				return existingPerson;
			});
		}
	}

	/**
	 * Verify if 2 plain text passwords match
	 * @param password1 {string} unencrypted password (i.e. value of the password field)
	 * @param password2 {string} unencrypted password (i.e. value of the verify_password field)
	 */
	plainPasswordsMatch(password1: string, password2: string): boolean {
		return password1 === password2;
	}

	/**
	 * Create an encrypted password
	 * @param typedPassword {string} plain text password (i.e. value of the password field)
	 */
	createPassword(typedPassword: string) {
		if (typedPassword) {
			const salt = bcrypt.genSaltSync(13);
			return bcrypt.hashSync(typedPassword, salt);
		}
		throw new Error('Missing Parameters, typedPassword');
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
			this.findPersonByEmail(email.toLowerCase()).then((personDoc: IPersonDocument) => {
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
			res.redirect('/auth/login');
		});
	}

	/**
	 * Update the values of a Person vertex. If a password is provided, update the password. If an email
	 * address is provided AND it doesn't match an already registered email address, update the password.
	 * @param req {Request}
	 * @param res {Response}
	 */
	async updatePerson(req: Request, res: Response) {
		const {vertexId} = req.params;
		const body = Object.assign({}, req.body);
		if (body.id && body.id !== vertexId) {
			res.status(400).send(`The ID in the payload (${body.id}) does not match the id in the route (${vertexId})`);
			return;
		}
		body.id = body.id || vertexId;
		const {new_password, verify_password, email} = body;
		delete body.password;
		if (new_password && verify_password) {
			if (!this.plainPasswordsMatch(new_password, verify_password)) {
				res.send({message: 'Passwords don\'t match'});
				return;
			}else{
				body.password = this.createPassword(new_password);
			}
			delete body.new_password;
			delete body.verify_password;
		}
		const dbPerson = await this.findPersonById(body.id);
		if (email) {
			const existingPerson: IPersonDocument | {message: string, code: string} = await this.verifyValidEmail(email, body.id);
			if (existingPerson && existingPerson.message && existingPerson.code) {
				res.status(400).send(existingPerson);
				return;
			}
		}
		const rawPerson = {...dbPerson, ...body};
		const person = new Person(this.db, rawPerson);
		try {
			const updatedPerson: Person | Error = await person.save();
			if (updatedPerson instanceof Person) {
				res.send(updatedPerson.toJsonString());
			}else{
				logger.error(`User profile update failed. ${updatedPerson.message}`);
				res.status(500).send({message: updatedPerson.message});
			}
		}catch(e) {
			logger.error(`User profile update failed. ${e.message}`);
			res.status(500).send({message: e.message});
		}
	}
}
