import React, { Component } from 'react';

export interface IAppContext {
	user: any | undefined;
	header: string | undefined;
	setHeader: any,
	setUser: any
}

const AppContext = React.createContext({});

export class AppProvider extends Component {
	public state = {
		user: undefined,
		header: 'express-auth-boilerplate',
		socketId: undefined
	};

	constructor(props: any) {
		super(props);
		this.setHeader = this.setHeader.bind(this);
		this.setUser = this.setUser.bind(this);
	}

	setHeader(header: string) {
		this.setState({header: header});
	}

	setUser(user: any) {
		this.setState({user: user});
	}

	render() {
		return (
			<AppContext.Provider
				value={{
					...this.state,
					setHeader: this.setHeader,
					setUser: this.setUser
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

export const AppConsumer = AppContext.Consumer;

