import React from 'react';
import { Route } from 'react-router';

import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

const Routes = (props: any) => {
	return (
		<App>
			<Route exact path='/' component={Home} />
			<Route exact path='/login' component={Login} />
			<Route exact path='/register' component={Register} />
		</App>
	);
}

export default Routes;
