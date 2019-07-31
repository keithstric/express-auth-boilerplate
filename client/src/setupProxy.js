/**
 * This file is to configure what routes get forwarded over to the backend running on a different port.
 *
 * This only runs from `npm start` in a development environment. It does not run in production.
 */
const proxy = require('http-proxy-middleware');

const getPaths = ['/api', '/logout'];
const postPaths = ['/login', '/register', '/api'];

module.exports = function(app) {
	const filter = (pathname, req) => {
		if (req.method === 'GET' && getPaths.indexOf(pathname) > -1) {
			return true;
		}else if (req.method === 'POST' && postPaths.indexOf('pathname') > -1) {
			return true;
		}
		return false;
	};

	const apiProxy = proxy(filter, {target: 'http://localhost:3001'})
	app.use(apiProxy);
};
