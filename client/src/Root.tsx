import React from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import { AppProvider } from './components/AppContext';
import Routes from './Routes';

const Root = () => {
	return (
		<Router>
			<AppProvider>
				<Routes />
			</AppProvider>
		</Router>
	);
}

export default Root;
