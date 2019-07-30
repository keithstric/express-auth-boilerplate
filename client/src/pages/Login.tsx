import React, { PureComponent } from 'react';
import { withAppContext, IAppContext } from '../components/AppContext';
import { RouteComponentProps } from 'react-router';

interface ILoginPageProps extends RouteComponentProps{
	appContext: IAppContext;
}
class LoginPage extends PureComponent<ILoginPageProps> {
	public state = {
		email: '',
		password: '',
		message: ''
	};

	componentDidMount() {
		this.props.appContext.setHeader('Login');
	}

	onChange = (evt: React.ChangeEvent) => {
		const target = evt.target as HTMLInputElement;
		this.setState({[target.name]: target.value, message: ''});
	}

	onSubmit = (evt: React.FormEvent) => {
		evt.preventDefault();
		const {email, password} = this.state;
		if (email && password) {
			const payload = {
				email: email,
				password: password
			};
			fetch('/login', {
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
					this.setState({message: respJson.message});
				}else{
					const user = respJson;
					delete user.db;
					this.props.appContext.setUser(user);
					this.setState({
						email: '',
						password: '',
						message: ''
					});
					this.props.history.push('/');
				}
			}).catch((err: Error) => {
				console.error('An error occurred during login:', err);
			});
		}
	}

	render() {
		const {message, email, password} = this.state;
		return (
			<div className="container">
				<div className="loginMessage" hidden={!message}>
					{message}
				</div>
				<form className="vertical" onSubmit={this.onSubmit}>
					<div className="formRow">
						<label>Email Address</label>
						<input
							type="email"
							className="formControl"
							placeholder="Enter Email Address"
							name="email"
							value={email}
							onChange={this.onChange}
						/>
					</div>
					<div className="formRow">
						<label>Password</label>
						<input
							type="password"
							className="formControl"
							placeholder="Enter Password"
							name="password"
							value={password}
							onChange={this.onChange}
						/>
					</div>
					<div className="formActionContainer horizontal flex-end">
						<button
							type="submit">
							Login
						</button>
					</div>
				</form>
			</div>
		);
	}
}

export default withAppContext(LoginPage);
