import React, { Component } from 'react';
import { withAppContext, IAppContext } from '../components/AppContext';
import { RouteComponentProps } from 'react-router';

interface IHomePageProps extends RouteComponentProps{
	appContext: IAppContext;
}
class HomePage extends Component<IHomePageProps> {

	componentDidMount() {
		this.props.appContext.setHeader('express-auth-boilerplate');
	}

	render() {
		const {user, authenticated} = this.props.appContext;
		const userName = user ? `${user.first_name} ${user.last_name}` : '';
		return (
			<div className='homePage'>
				<div className="userDisplay">
					<span hidden={!authenticated}>Home Page {userName}</span>
					<span hidden={authenticated}>No User</span>
				</div>
			</div>
		);
	}
}

export default withAppContext(HomePage);
