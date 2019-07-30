import React, { Component } from 'react';

export interface IAppContext {
	user: any | undefined;
	header: string | undefined;
	authenticated: boolean;
	setHeader: any;
	setUser: any;
}

const AppContext = React.createContext({});

export class AppProvider extends Component {

	constructor(props: any) {
		super(props);
		const user = sessionStorage.getItem('express-auth:user');
		const hasCookie = doesHttpOnlyCookieExist('expressAuthSession');
		this.state = {
			user: user ? JSON.parse(user) : null,
			authenticated: sessionStorage.getItem('express-auth:user') && hasCookie ? true : false,
			header: 'express-auth-boilerplate',
			setHeader: this.setHeader,
			setUser: this.setUser
		};
	}

	setHeader = (header: string) => {
		this.setState({system: {header: header}});
	}

	setUser = (user: any) => {
		if (user) {
			sessionStorage.setItem('express-auth:user', JSON.stringify(user));
		}
		this.setState({
			authenticated: user ? true : false,
			user: user
		});
	}

	render() {
		return (
			<AppContext.Provider
				value={{
					...this.state
				}}>
				{this.props.children}
			</AppContext.Provider>
		);
	}
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function withAppContext<
	P extends { appContext?: IAppContext},
	R = Omit<P, "appContext">
>(
	Component: React.ComponentClass<P> | React.StatelessComponent<P>
): React.SFC<R> {
	return function BoundComponent(props: R) {
		return (
			<AppContext.Consumer>
				{state => <Component {...props as any} appContext={state} />}
			</AppContext.Consumer>
		);
	};
}

function doesHttpOnlyCookieExist(cookiename: string) {
	var d = new Date();
	d.setTime(d.getTime() + (1000));
	var expires = "expires=" + d.toUTCString();

	document.cookie = cookiename + "=new_value;path=/;" + expires;
	if (document.cookie.indexOf(cookiename + '=') == -1) {
		return true;
	 } else {
		return false;
	 }
 }

export const AppConsumer = AppContext.Consumer;

