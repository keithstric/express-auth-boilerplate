/**
 * This file sets up swagger-js and swagger-ui-express to
 * automatically generate swagger documentation and swagger.json.
 * For jsDoc structure visit:
 * - https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md
 * - https://github.com/Surnet/swagger-jsdoc/tree/master/example/v2
 * - https://swagger.io/docs/specification/paths-and-operations/
 * - https://www.oodlestechnologies.com/blogs/Integrate-Swagger-in-your-NodeJS-Application/
 */

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';

const options = {
	definition: {
		swagger: '2.0',
		info: {
			title: 'Makers Unite',
			version: '0.1.0',
			description: 'Social App for Makers to connect',
			contact: {
				name: 'Keith Strickland',
				email: 'keithstric@gmail.com'
			}
		},
		basePath: '/'
	},
	apis: ['./dist/routes/auth-endpoints.js']
};

const swaggerSpec = swaggerJsdoc(options);
const swaggerDocs = (app: Application) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;
