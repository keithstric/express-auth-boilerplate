import React, {PureComponent} from 'react';
import { withAppContext, IAppContext } from '../components/AppContext';
import { RouteComponentProps } from 'react-router';
import PersonForm from '../components/personForm';

interface IRegisterPageProps extends RouteComponentProps{
	appContext: IAppContext;
}

class ProfilePage extends PureComponent<IRegisterPageProps> {
	public state = {
		first_name: this.props.appContext.user.first_name,
		last_name: this.props.appContext.user.last_name,
		email: this.props.appContext.user.email,
		id: this.props.appContext.user.id,
		rid: this.props.appContext.user['@rid'],
		new_password: '',
		verify_password: '',
		message: ''
	};

	componentDidMount() {
		this.props.appContext.setHeader('User Profile');
		if (!this.props.appContext.authenticated) {
			this.setState({
				first_name: '',
				last_name: '',
				email: '',
				id: '',
				rid: '',
				new_password: '',
				verify_password: '',
				message: ''
			});
			this.props.history.push('/login');
		}
	}

	onChange = (evt: React.ChangeEvent) => {
		const target = evt.target as HTMLInputElement;
		let targetName = target.name;
		console.log('Profile.onChange, targetName=', targetName);
		if (targetName === 'password') {
			targetName = 'new_password';
		}
		this.setState({[targetName]: target.value});
	}

	onSubmit = (evt: React.FormEvent) => {
		evt.preventDefault();
		const {first_name, last_name, email, new_password, verify_password} = this.state;
		const {user} = this.props.appContext;
		if (first_name && last_name && email) {
			const payload = {
				...user,
				first_name,
				last_name,
				email
			};
			if (new_password && verify_password) {
				payload.new_password = new_password;
				payload.verify_password = verify_password;
			}
			fetch(`/api/vertex/${user.id}`, {
				method: 'PUT',
				cache: 'no-cache',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			}).then((resp: Response) => {
				if (resp && resp.ok) {
					return resp.json();
				}
				return null;
			}).then((respJson: any) => {
				if (respJson.message) {
					this.setState({message: respJson.message});
					if (respJson && respJson.code === '01') {
						this.setState({email: this.props.appContext.user.email})
					}
				}else {
					const user = respJson;
					delete user.db;
					this.props.appContext.setUser(user);
					this.setState({message: undefined});
				}
			});
		}
	}

	render() {
		const {id, rid, message} = this.state;
		const user = {
			first_name: this.state.first_name,
			last_name: this.state.last_name,
			email: this.state.email,
			password: this.state.new_password,
			verify_password: this.state.verify_password,
			'@class': this.props.appContext.user['@class'],
			id: this.state.id
		};
		return (
			<div className="container">
				<div className="horizontal smallText spaceBottom">
					<span className="boldText">Identification:&nbsp;</span>
					<span>{id} :: {rid}</span>
				</div>
				<div className="loginMessage" hidden={!message}>
					{message}
				</div>
				<PersonForm
					user={user}
					onSubmit={this.onSubmit}
					onChange={this.onChange}
					buttonText="Update Profile"
					passwordLabel="Change Password" />
			</div>
		);
	}
}

export default withAppContext(ProfilePage);
