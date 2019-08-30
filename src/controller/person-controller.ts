import { Person, IPersonDocument } from '../models/Person';
import { Db } from 'orientjs';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { VertexController } from './vertex-controller';

export class PersonController extends VertexController {
	person: Person;
	db: Db;

	constructor(db: Db, person?: Person) {
		super(db, person);
		this.person = person;
		if (db) {
			this.db = db;
		}else{
			throw new Error('You must provide the Database connection to PersonController');
		}
	}
	/**
	 * Update the values of a Person vertex. If a password is provided, update the password. If an email
	 * address is provided AND it doesn't match an already registered email address, update the password.
	 * @param req {Request}
	 * @param res {Response}
	 */
	updatePerson(req: Request, res: Response) {
		const {vertexId} = req.params;
		const newPayload = Object.assign({}, req.body);
		newPayload.id = newPayload.id || vertexId;
		const {new_password, verify_password, email} = newPayload;
		delete newPayload.password;
		if (new_password && verify_password) {
			if (new_password !== verify_password) {
				res.send({message: 'Passwords don\'t match'});
				return;
			}else{
				const hashedPassword = this.createPassword(new_password);
				newPayload.password = hashedPassword;
			}
			delete newPayload.new_password;
			delete newPayload.verify_password;
		}
		this.person = new Person(this.db, newPayload);
		this.person.findPersonByEmail(email).then((existingPerson: IPersonDocument) => {
			if (existingPerson && existingPerson.id !== this.person.id) {
				res.status(400).send({
					message: `User with email address ${existingPerson.email} already exists!`,
					code: '01'
				});
				return;
			}else {
				return this.person.save();
			}
		}).then((updatedPerson: Person) => {
			if (updatedPerson) {
				res.send(updatedPerson.toJson());
				logger.info(`User with ${this.person['@rid'] ? 'rid' : 'id'} "${this.person['@rid'] ? this.person['@rid'] : this.person.id}" & email "${this.person.email}" updated their profile}`);
			}
		}).catch((err: Error) => {
			logger.error(`User profile update failed. ${err.message}`);
			res.status(500).send({message: err.message});
		});
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
}
