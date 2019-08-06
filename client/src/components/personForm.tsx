import React from 'react';

export interface IPersonFormProps {
	user: any;
	buttonText: string;
	onSubmit: any;
	onChange: any;
	passwordLabel?: string;
}

const PersonForm = (props: IPersonFormProps) => {
	const {first_name, last_name, email, password, verify_password} = props.user;
	const {onSubmit, onChange, buttonText, passwordLabel} = props;

	return (
		<div className="container">
			<form onSubmit={onSubmit}>
					<div className="formRow">
						<label>First Name</label>
						<input
							type="text"
							className="formControl"
							placeholder="Enter First Name"
							name="first_name"
							value={first_name}
							onChange={onChange}
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
							onChange={onChange}
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
							onChange={onChange}
						/>
					</div>
					<div className="formRow">
						<label>{passwordLabel || 'Password'}</label>
						<input
							type="password"
							className="formControl"
							placeholder="Enter Password"
							name="password"
							value={password}
							onChange={onChange}
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
							onChange={onChange}
						/>
					</div>
					<div className="formActionContainer horizontal flex-end">
						<button
							type="submit">
							{buttonText}
						</button>
					</div>
				</form>
		</div>
	);
}

export default PersonForm;
