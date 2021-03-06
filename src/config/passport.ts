/**
 * This file sets up the passport authentication middleware and user serialization/deserialization
 * https://passportjs.org
 */
import passport from 'passport';
import passportLocal from 'passport-local';
import { Application } from 'express';
import { Db } from 'orientjs';
import {PersonController} from '../controller/person-controller';
import { Person, IPersonDocument } from '../models/Person';
import { logger } from './logger/logger';

const initPassport = (app: Application, db: Db) => {
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user_id: string, done: any) {
		done(null, user_id);
	});

	passport.deserializeUser(function(user_id: string, done: any) {
		done(null, user_id);
	});

	/**
	 * Passport middleware. This is called from `passport.authenticate()`.
	 * Will get the user from the database and compare passwords
	 * the done function accepts 3 arguments: error, truthy/false, {message: string}
	 * if false is provided (2nd arg) it means the request failed. truthy is success
	 * the message is posted as a flash message
	 */
	passport.use(new passportLocal.Strategy({usernameField: 'email'}, (email: string, password: string, done: any) => {
		const user = new Person(db);
		const personController = new PersonController(db);
		personController.findPersonByEmail(email).then((personDoc: IPersonDocument) => {
			const person = personDoc ? new Person(db, personDoc) : undefined;
			if (person) {
				personController.person = person;
				if (personController.comparePassword(password)) {
					done(null, person);
				}else {
					done(null, false, {message: 'Incorrect Password'});
				}
			}else {
				done(null, false, {
					message: `Email Address "${email}" not found`,
					code: '02'
				});
			}
		}).catch((err: Error) => {
			logger.error(`Error occurred in passport middleware: ${err.message}`);
			done(err, false, {message: err.message});
		});
	}));
};

export default initPassport;
