import React, { PureComponent } from 'react';
import { withAppContext, IAppContext } from '../components/AppContext';
import { RouteComponentProps } from 'react-router';

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
		const {message, first_name, last_name, email, password, verify_password} = this.state;
		return (
			<div className="container">
				<div className="loginMessage" hidden={!message}>
					{message}
				</div>
				<form onSubmit={this.onSubmit}>
					<div className="formRow">
						<label>First Name</label>
						<input
							type="text"
							className="formControl"
							placeholder="Enter First Name"
							name="first_name"
							value={first_name}
							onChange={this.onChange}
						/>
					</div>
					<div className="formRow">
						<label>Last Name</label>
						<input
							type="text"
							className="formControl"
							placeholder="Enter Last Name"
							name="last_name"
							value={last_name}
							onChange={this.onChange}
						/>
					</div>
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
					<div className="formRow">
						<label>Verify Password</label>
						<input
							type="password"
							className="formControl"
							placeholder="Verify Password"
							name="verify_password"
							value={verify_password}
							onChange={this.onChange}
						/>
					</div>
					<div className="formActionContainer horizontal flex-end">
						<button
							type="submit">
							Register
						</button>
					</div>
				</form>
			</div>
		);
	}
}

export default withAppContext(RegisterPage);
