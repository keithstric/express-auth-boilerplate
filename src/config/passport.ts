import passport from 'passport';
import passportLocal from 'passport-local';
import { Application } from 'express';
import { Db } from 'orientjs';
import { Person } from '../models/Person';

const initPassport = (app: Application, db: Db) => {
	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user_uuid: string, done: any) {
		// console.log('config/passport.ts, passport.serializeUser, user_uuid=', user_uuid);
		done(null, user_uuid);
	});

	passport.deserializeUser(function(user_uuid: string, done: any) {
		// console.log('config/passport.ts, passport.deserializeUser, user_uuid=', user_uuid);
		done(null, user_uuid);
	});

	passport.use(new passportLocal.Strategy({usernameField: 'email'}, (email: string, password: string, done: any) => {
		const user = new Person(db);
		user.init(email).then((person: any) => {
			if (person) {
				if (person.comparePassword(password)) {
					done(null, person.uuid);
				}else {
					done(null, false, {message: 'Incorrect Password'});
				}
			}else {
				done(null, false, {message: `Email Address "${email}" not found`});
			}
		}).catch((err: Error) => {
			console.error(err);
			done(err, false, {message: err.message});
		});
	}));
}

export default initPassport;
