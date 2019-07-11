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
		const {user} = this.props.appContext;
		const userName = user ? user.first_name + ' ' + user.last_name : '';
		return (
			<div className='homePage'>
				Home Page {userName}
			</div>
		);
	}
}

export default withAppContext(HomePage);
