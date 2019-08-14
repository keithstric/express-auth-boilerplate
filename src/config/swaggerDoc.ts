/**
 * This file sets up swagger-js and swagger-ui-express to
 * automatically generate swagger documentation and swagger.json. It also
 * sets up the reusable models for swagger.
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
		components: {
			schemas: {
				Error: {
					type: 'object',
					properties: {
						data: {
							type: 'object'
						},
						hasMore: {
							type: 'number'
						},
						id: {
							type: 'number'
						},
						message: {
							type: 'string'
						},
						name: {
							type: 'string'
						},
						previous: {
							type: 'array',
							items: {
								type: 'object'
							}
						},
						type: {
							type: 'string'
						}
					}
				},
				Log: {
					type: 'object',
					properties: {
						message: {
							type: 'string'
						},
						level: {
							type: 'string'
						},
						service: {
							type: 'string'
						},
						timestamp: {
							type: 'string'
						}
					}
				},
				Person: {
					allOf: [
						{
							'$ref': '#/components/schemas/Vertex'
						},{
							type: 'object',
							properties: {
								first_name: {
									type: 'string'
								},
								last_name: {
									type: 'string'
								},
								email: {
									type: 'string'
								},
								password: {
									type: 'string'
								}
							}
						}
					]
				},
				Vertex: {
					type: 'object',
					properties: {
						'@class': {
							type: 'string'
						},
						'@rid': {
							type: 'string'
						},
						'@type': {
							type: 'string'
						},
						'@version': {
							type: 'string'
						},
						created_date: {
							type: 'string'
						},
						id: {
							type: 'string'
						}
					}
				}
			},
			responses: {
				Error: {
					description: 'Error Object',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Error'
							}
						}
					}
				},
				Message: {
					description: 'Message Object',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									message: {
										type: 'string'
									}
								}
							}
						}
					}
				},
				Person: {
					description: 'Person Object',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Person'
							}
						}
					}
				},
				Vertex: {
					description: 'Vertex Object',
					content: {
						'application/json': {
							schema: {
								'$ref': '#/components/schemas/Vertex'
							}
						}
					}
				},
				VertexArray: {
					description: 'Array of vertices',
					content: {
						'application/json': {
							schema: {
								type: 'array',
								items: {
									'$ref': '#/components/schemas/Vertex'
								}
							}
						}
					}
				}
			},
			parameters: {
				ObjectQueryParam: {
					in: 'query',
					name: 'params',
					description: 'A JSON object that includes the query parameters to query the DB',
					schema: {
						type: 'object',
						additionalProperties: {
							type: 'object'
						}
					},
					style: 'form',
					explode: true
				},
				DbQueryOperatorParam: {
					in: 'query',
					name: 'queryOperator',
					schema: {
						type: 'string',
						enum: [
							'=',
							'like',
							'<',
							'<=',
							'>',
							'>=',
							'<>',
							'BETWEEN',
							'IS',
							'INSTANCEOF',
							'IN',
							'CONTAINS',
							'CONTAINSALL',
							'CONTAINSKEY',
							'CONTAINSVALUE',
							'CONTAINSTEXT',
							'MATCHES'
						]
					}
				}
			}
		},
		tags: [
			{
				name: 'authentication',
				description: 'The Registration and Login process'
			},{
				name: 'system',
				description: 'System Endpoints'
			},{
				name: 'Db',
				description: 'Database Endpoints'
			}
		],
		basePath: '/'
	},
	apis: [
		'./dist/routes/auth-endpoints.js',
		'./dist/routes/system-endpoints.js',
		'./dist/routes/db-endpoints.js'
	]
};

const swaggerOptions = {
	customCssUrl: '/theme-material.css'
}

const swaggerSpec = swaggerJsdoc(options);
const swaggerDocs = (app: Application) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
	app.get('/api-docs.json', (req: Request, res: Response) => {
		res.send(swaggerSpec);
	});
};

export default swaggerDocs;
