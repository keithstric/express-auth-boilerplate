import React, { Component } from 'react';
import { withAppContext, IAppContext } from '../components/AppContext';
import { RouteComponentProps } from 'react-router';

interface IHomePageProps extends RouteComponentProps{
	appContext: IAppContext;
}
class HomePage extends Component<IHomePageProps> {
	public state = {
		people: []
	};

	componentDidMount() {
		this.props.appContext.setHeader('express-auth-boilerplate');
		if (this.props.appContext.authenticated) {
			fetch('/api/vertices/person', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}).then((resp: Response) => {
				if (resp && resp.ok) {
					return resp.json();
				}
				return null;
			}).then((resp: any) => {
				if (resp) {
					this.setState({people: resp})
				}
			});
		}
	}

	render() {
		const {user, authenticated} = this.props.appContext;
		const {people} = this.state;
		const userName = user ? `${user.first_name} ${user.last_name}` : '';
		return (
			<div className='homePage'>
				<div className="userDisplay">
					<span hidden={!authenticated}>Home Page {userName}</span>
					<span hidden={authenticated}>No User</span>
				</div>
				<div className='listContainer' hidden={!authenticated}>
					<ul>
					{people.map((person: any) => {
						return <li key={person.email}>{person.first_name} {person.last_name} - {person.email}</li>
					})}
					</ul>
				</div>
			</div>
		);
	}
}

export default withAppContext(HomePage);
