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
import { Application, Request, Response } from 'express';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'express-auth-boilerplate',
			version: '0.1.0',
			description: 'Boilerplate api for authentication and db queries',
			contact: {
				name: 'Red Pill Now',
				email: 'info@redpillnow.com',
				url: 'https://www.redpillnow.com'
			}
		},
		basePath: '/'
	},
	apis: [
		'./dist/routes/auth-endpoints.js',
		'./dist/routes/system-endpoints.js',
		'./dist/routes/db-endpoints.js'
	]
};

const swaggerSpec = swaggerJsdoc(options);
const swaggerDocs = (app: Application) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	app.get('/api-docs.json', (req: Request, res: Response) => {
		res.send(swaggerSpec);
	});
};

export default swaggerDocs;
