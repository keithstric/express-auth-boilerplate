# express-auth-boilerplate

This is a boilerplate project to setup express, passport and orientdb. API Routes provided are for authorization, registration and basic DB Querying. If you want to use some other database, just replace the orientdb Docker configuration with your preferred DB.

## Services Provided

The following services are provided by this project:

* Express.js Application
	* Passport Authentication (local)
	* Winston logging to OrientDb and console
	* Swagger docs (/api-docs)
	* Swagger json file (/api-docs.json)
* Base React client application
* OrientDB
* Redis - For pub/sub and Session storage

## Dependencies

To run this application there are some dependencies you will need to have installed locally.

* [node.js](https://nodejs.org) - A JavaScript runtime built on Chrome's V8 JavaScript engine.
* [docker](https://docker.com) - Securely build, share and run any application, anywhere.
* [typescript](https://www.npmjs.com/package/typescript) - _Optional_ install globally

## package.json Scripts

* postinstall - Runs the build script once `npm install` is done
* build - Compiles all TypeScript to JavaScript and places in the `./dist` directory
* start:docker - Starts the docker containers
* build:start:docker - Builds the docker containers and then starts them
* start - Starts the node application (Used inside Docker container)
* watch - Starts `tsc-watch`. Will reload the node application when changes are made in the `./src` directory (Used inside Docker container)
* stop:docker - Stops all docker containers

## Getting started - Development

Below are the steps required to get started developing your application.

### Initial Process

* Ensure dependencies are installed (node.js and Docker)
* Clone this repository to your local machine
* Create your `.env` file with appropriate values (See the Environment Variables section)
* run `npm install`
* run `npm run build`
* run `npm run build:start:docker`

This will create 3 docker containers:

* redis - Redis server for user session storage and pub/sub
	* Exposes port `REDIS_PORT` to Docker and the Local environment
* orientdb - Orient DB instance with a Person vertex
	* Exposes port `DB_STUDIO_PORT` (OrientDb Studio) and `DB_PORT` to Docker and the Local environment
* express-auth-boilerplate - This project
	* Exposes port defined in the `WEB_LOCAL_PORT` environment variable to the local environment and `WEB_PORT` to Docker

### Environment Variables

After cloning this repository you will find the `.env.default` file. Copy this file to `.env` and provide values for the properties. *DO NOT* commit your `.env` file to the repository. This file contains sensitive information that we do not want made available to the public.

* NODE_ENV - The node environment to use. Valid values are "development" and "production"
* DB_HOST - host name for the orientDB container
* DB_USER - User name for using the database
* DB_PASSWORD - Password for the _DB_USER_
* DB_NAME - Name of the database to use for this application
* DB_PORT - Port number the database uses
* DB_STUDIO_PORT - Port number for the OrientDB Studio
* DB_ROOT_USER - Root User for orientDB
* DB_ROOT_PASSWORD - Password for the _DB_ROOT_USER_
* REDIS_HOST - Host name for the redis container
* REDIS_PORT - Port number redis will use
* WEB_PORT - The port number that will be surfaced for the web app inside the docker container
* WEB_LOCAL_PORT - The port number that will be surfaced for the web app on the local machine
* WEB_DEBUG_PORT - The port number that will be surfaced for attaching a remote debugger
* WEB_SESS_NAME - The name of web user sessions (i.e. Cookie name)
* WEB_SESS_SECRET - Random string for hashing the value for the user session
* WEB_SESS_DURATION - Number of MilliSeconds a session should remain active
* LDAP_SERVER - The LDAP server host name
* LDAP_SERVER_PORT - The port the LDAP server listens on (default: 389)
* LDAP_SEARCH_BASE - The LDAP Search Base
* LDAP_SEARCH_FILTER - The LDAP Search filter
* LDAP_USERNAME_FIELD - The name of the _username_ field
* LDAP_PASSWORD_FIELD - The name of the _password_ field

### After the "Initial Process"

After the initial process has been executed and you have 3 docker containers running. Ensure you can access those containers via a browser or Curl command. As you make changes to your application and save your changes, you should see the express-auth-boilerplate container restart the node application. Your changes will be available after the restart.

### Renaming the Orient database

If you wish to rename the database to something that better suits the project. In your file manager, navigate to `./orientdb/databases` and rename the below files and directories:

* express-auth-boilerplate directory
* All `express-auth-boilerplate*.wal` files
* All `express-auth-boilerplat*.wmr` files

Please be aware that renaming the database will prompt some required and some optional code changes. This list may/may not be complete:

* `./.env`
    * DB_NAME
    * WEB_SESS_NAME(?)
* `./src/config/logger/logger.ts` - Update service name
* `./src/config/swaggerDoc.ts` - Update title
* `./src/app.ts` - Update log message for server startup
* `./docker-compose.yml`
    * *NOT* express-auth-boilerplate image name
    * express-auth-server service name
    * express-auth-server volume names
* `./Dockerfile` - WORKDIR
* `./package.json` - name property
* `./client/src/pages/Home.tsx` - setHeader
* `./client/src/components/AppContext.tsx` - header

### Express Routes

The following routes are available within this project.

* `/auth/login` - GET - The React Login page
* `/api/login` - POST - Route to POST the login form to
* `/api/logout` - GET - Route to logout
* `/api/register` - POST - Register a new user
* `/api-docs` - GET - Route for the Swagger Documentation
* `/api-docs.json` - GET - Get the `swagger.json` file
* `/api/logs` - GET - Get the most recent log entries or query the log
* `/api/vertices` - GET - Query the DB for vertices
* `/api/vertices/:vertexType` - GET - Get a list of vertices by class name
* `/api/vertex/:vertexId` - GET - Get a vertex by it's id
* `/api/vertex/:vertexId` - PUT - Update a vertex

## Docker

This project utilizes [Docker](https://docker.com) to provide the node.js, orientDB and Redis services. This ensures consistency between instances and ease of deployment.

### Docker Images

* [redis](https://hub.docker.com/_/redis) - Redis is an open source key-value store that functions as a data structure server.
* [orientdb](https://hub.docker.com/_/orientdb) - OrientDB a Multi-Model Open Source NoSQL DBMS that combines graphs and documents.
* [node](https://hub.docker.com/_/node) - Node.js is a JavaScript-based platform for server-side and networking applications.

### Docker Volumes

The following directories are defined as volumes inside Docker. This ensures any changes made within the local directories on the Docker host are updated in the Docker container.

* `./client/` --> `/usr/express-auth-boilerplate/client/`
* `./dist/` --> `/usr/express-auth-boilerplate/dist/`
* `./src/` --> `/usr/express-auth-boilerplate/src/`
* `./orientdb/backup` --> `/orientdb/backup/`
* `./orientdb/databases` --> `/orientdb/databases/`
* `./redisData/` --> `/redisData/`

### Docker Port Mapping

The following ports are exposed to the local machine. All of these ports are defined as environment variables. Format below is _Local Machine Port Number_ --> _Docker Port Number_

* `${DB_STUDIO_PORT}` --> `${DB_STUDIO_PORT}` - Port number for the orientdb studio, default is 2480
* `${DB_PORT}` --> `${DB_PORT}` - Port number for orientdb, default is 2424
* `${REDIS_PORT}` --> `${REDIS_PORT}` - Port number for redis, default is 6379
* `${WEB_LOCAL_PORT}` --> `${WEB_PORT}` - Port number for HTTP, default local port is 3001, default docker port is 80
* `${WEB_DEBUG_PORT}` --> `${WEB_DEBUG_PORT}` - Port number for remote debugger, default is 5858

### Manually Building the Docker Environment

There are scenarios where you will need to re-build your docker environment. These scenarios are listed below:

* You add node modules by running `npm install ...`
* You modify your `Dockerfile` file
* You modify your `docker-compose.yml` file

In these instances you will need to force Docker to rebuild it's containers. Just run:

`npm run build:start:docker`

This will rebuild the docker containers.

### Starting/Stopping the Docker Environment

To start the Docker environment without rebuilding run:

`npm run start:docker`

To stop the Docker environment run:

`npm run stop:docker`

## The React client

Documentation for the client is in `client/README.md`. The client dev server runs on `http://localhost:3000`. Pertinent requests are proxied to the express server (`http://localhost:3001`). To start the client:

* Open a terminal
* `cd client/`
* run `npm start` - this will compile the client code and open a browser tab

If you wish to surface the client app in your docker container and will not be changing the client app:

* Open a terminal
* `cd ./client/`
* run `npm run build` - This will compile the client code and place it in `./client/build/` which will then be available within the docker container.

## Considerations for Domino Authentication

There is a lot here that isn't needed if this is to be strictly used to authenticate with Domino LDAP. Below is a list of things that will need to be changed to fit that role.

>NOTE: It may be prudent to create a new starter kit _just_ for domino authentication.

### docker-compose.yml

* Remove the orientdb and redis services
* Add the `client` directory as a volume, this is optional but will allow usage of the React app for login/logout
* Add the `LDAP` properties to `environment`
* Remove the `REDIS` and `DB` properties from `environment`

### .env

* Remove all `DB_` references
* Remove all `REDIS_` references
* Add all `LDAP_` references

### Files and Directories

You can effectively remove the following files as they will no longer be needed. Once you do this you will need to correct all the files that import these files and make calls to their exported functions. _(* indicates optional)_

* `./src/helpers/`
* `./src/models/`
* `./src/routes/db-endpoints.ts`
* `./src/config/orient-db.ts`
* *Remove or Modify - `./client/src/components/personForm.tsx`
* *`./client/src/pages/Home.tsx`
* *`./client/src/pages/Profile.tsx`
* *`./client/src/pages/Register.tsx`

### SwaggerDoc Configuration

You will need to modify the SwaggerDoc configuration in `./src/config/swaggerDoc.ts`. You can modify or remove the following items:

#### schemas

* Remove `options.definition.components.schemas.Vertex`
* Modify `options.definition.components.schemas.Person` to match what you will get from the LDAP server

#### responses

* Remove `options.definition.components.responses.Vertex`
* Remove `options.definition.components.responses.VertexArray`

#### parameters

* Remove `options.definition.components.parameters`

#### tags

* Remove `options.definition.components.tags.Db`

#### apis

* Remove array member `./dist/routes/db-endpoints.js` from `options.apis`

## Node Projects of Interest

* [node.js](https://nodejs.org) - Node.js
* [express](https://expressjs.com) - The Web API
* [orientjs](https://www.npmjs.com/package/orientjs) - OrientDB JavaScript Driver
* [passport](https://passportjs.org) - Web Authentication
* [passport-local](http://www.passportjs.org/packages/passport-local/) - Passport.js Local Strategy
* [passport-ldapauth](http://www.passportjs.org/packages/passport-ldapauth/) - Passport.js LDAP Strategy (For Domino Only, not included in project)
* [winston](https://www.npmjs.com/package/winston) - A Logger
* [swagger](https://swagger.io) - API Documentation
* [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) - The swagger UI for express
* [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) - Module which provides the ability to define swagger documentation in [JSDoc](https://devdocs.io/jsdoc/) format
* [typescript](https://www.typescriptlang.org) - A superset of JavaScript
* [react](https://reactjs.org) - The React Project
