import React, { PureComponent } from 'react';
import { withAppContext, IAppContext } from '../components/AppContext';
import { RouteComponentProps } from 'react-router';
import PersonForm from '../components/personForm';

interface IRegisterPageProps extends RouteComponentProps{
	appContext: IAppContext;
}
class RegisterPage extends PureComponent<IRegisterPageProps> {
	public state = {
		first_name: '',
		last_name: '',
		email: '',
		password: '',
		verify_password: '',
		message: ''
	};

	componentDidMount() {
		this.props.appContext.setHeader('Register');
	}

	onChange = (evt: React.ChangeEvent) => {
		const target = evt.target as HTMLInputElement;
		this.setState({[target.name]: target.value});
	}

	onSubmit = (evt: React.FormEvent) => {
		evt.preventDefault();
		const {first_name, last_name, email, password, verify_password} = this.state;
		if (first_name && last_name && email && password && verify_password) {
			const payload = {
				first_name,
				last_name,
				email,
				password,
				verify_password
			};
			fetch('/register', {
				method: 'POST',
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
					this.setState({message: respJson.message})
				}else {
					const user = respJson;
					delete user.db;
					this.props.appContext.setUser(user);
					this.setState({
						first_name: '',
						last_name: '',
						email: '',
						password: '',
						verify_password: ''
					});
					this.props.history.push('/');
				}
			});
		}
	}

	render() {
		const {message} = this.state;
		const user = {
			first_name: this.state.first_name,
			last_name: this.state.last_name,
			email: this.state.email,
			password: this.state.password,
			verify_password: this.state.verify_password
		};
		return (
			<div className="container">
				<div className="loginMessage" hidden={!message}>
					{message}
				</div>
				<PersonForm user={user} onSubmit={this.onSubmit} onChange={this.onChange} buttonText="Register" />
			</div>
		);
	}
}

export default withAppContext(RegisterPage);
