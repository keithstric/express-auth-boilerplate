import { Db } from "orientjs";
import { getVertexByProperty } from "../helpers/db-helpers";
import bcrypt from 'bcrypt';

export interface PersonDocument {
	email: string|undefined;
	first_name: string|undefined;
	last_name: string|undefined;
	password: string|undefined;
	id?: string|undefined;
	created_date?: string|undefined;
	in_knows?: string[];
	in_tutors?: string[];
	in_visited?: string[];
	out_authored?: string[];
	out_created?: string[];
	out_knows?: string[];
	out_liked?: string[];
	out_locatedAt?: string[];
	out_rated?: string[];
	out_shared?: string[];
	out_visited?: string[];
}

export class Person implements PersonDocument {
	email: string;
	first_name: string;
	last_name: string;
	id: string;
	password: string;
	created_date: string;
	exists: boolean = false;
	db: Db;

	constructor(db: Db) {
		this.db = db;
	}

	init(email: string) {
		if (email && this.db) {
			return getVertexByProperty('Person', 'email', email.toLowerCase(), this.db)
			.then((person: PersonDocument) => {
				if (person) {
					this.exists = true;
					this.initObject(person);
					return this;
				}
			});
		}
		throw new Error('You must provide an email address and database');
	}

	initObject(apiObj: PersonDocument) {
		if (apiObj) {
			this.email = apiObj.email;
			this.first_name = apiObj.first_name;
			this.last_name = apiObj.last_name;
			this.id = apiObj.id;
			this.password = !this.password ? apiObj.password : this.password;
		}
	}

	comparePassword(typedPassword: string): boolean {
		if (typedPassword) {
			return bcrypt.compareSync(typedPassword, this.password);
		}
		throw new Error('Missing parameters');
	}
}
