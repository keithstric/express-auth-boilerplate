# express-auth-boilerplate

This is a boilerplate project to setup express, passport and orientdb.

## Dependencies

To run this application locally there are some dependencies you will need to have installed locally.

* [node.js](https://nodejs.org) - A JavaScript runtime built on Chrome's V8 JavaScript engine.
* [docker](https://docker.com) - Securely build, share and run any application, anywhere.
* [typescript](https://www.npmjs.com/package/typescript) - _Optional_ install globally

## Environment Variables

After cloning this repository you will find a `.env.default` file. Copy this file to `.env` and provide values for the properties. *DO NOT* commit your `.env` file to the repository. This file contains sensitive information that we do not want made available to the public.

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

## Docker Images

* [redis](https://hub.docker.com/_/redis) - Redis is an open source key-value store that functions as a data structure server.
* [orientdb](https://hub.docker.com/_/orientdb) - OrientDB a Multi-Model Open Source NoSQL DBMS that combines graphs and documents.
* [node](https://hub.docker.com/_/node) - Node.js is a JavaScript-based platform for server-side and networking applications.

## package.json Scripts

* postinstall - Runs the build script once `npm install` is done
* build - Compiles all TypeScript to JavaScript and places in the `./dist` directory
* start:docker - Starts the docker containers
* build:start:docker - Builds the docker containers and then starts them
* start - Starts the node application
* watch - Starts `tsc-watch`. Will reload the node application when changes are made in the `./src` directory
* stop:docker - Stops all docker containers

## Getting started - Development

Below are the steps required to get started developing your application.

### Initial Process

* Clone this repository to your local machine
* Ensure dependencies are installed (node.js and Docker)
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

### After the "Initial Process"

After the initial process has been executed and you have 3 docker containers running. Ensure you can access those containers via a browser or Curl command. As you make changes to your application and save your changes, you should see the express-auth-boilerplate container restart the node application with your changes available after the restart.

## Docker

This project utilizes [Docker](https://docker.com) to provide the node.js, orientDB and Redis services. This ensures consistency between instances and ease of deployment.

### Manually Building the Docker Environment

There are scenarios where you will need to re-build your docker environment. These scenarios are listed below:

* You add node modules by running `npm install ...`
* You modify your `Dockerfile` file
* You modify your `docker-compose.yml` file

In these instances you will need to force Docker to rebuild it's containers. Just run `npm run build:start:docker`. This will rebuild the docker containers.

### Starting/Stopping the Docker Environment

To start the Docker environment run:

`npm run start:docker`

To stop the Docker environment run:

`npm run stop:docker`

## Projects of Interest

* [node.js](https://nodejs.org) - Node.js
* [express](https://expressjs.com) - The Web API
* [orientjs](https://www.npmjs.com/package/orientjs) - OrientDB JavaScript Driver
* [passport](https://passportjs.org) - Web Authentication
* [winston](https://www.npmjs.com/package/winston) - A Logger
* [swagger](https://swagger.io) - API Documentation
* [typescript](https://www.typescriptlang.org/)
