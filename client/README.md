This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## What's Included

This is just a basic application with a header and a few pages (login, home, register). No assumptions are made about what should be available and what shouldn't. Base routing is also included.

* Components
	* Layout
		* Header.tsx - The application header
		* Content.tsx - The content area where are pages are displayed
	* AppContext.tsx - The application context as a High Order Component
* Pages
	* Home.tsx - The home page
	* Login.tsx - The login page
	* Register.tsx - The registration page
* Style
	* App.css - Some base CSS for the entire app
	* Index.css - Body and code tag styles
* App.tsx - The application wrapper
* index.tsx - The entry point into the application, contains the Root component
* react-app-env.d.ts - TypeScript reference
* Root.tsx - This is the component rendered by index.tsx. Includes the Router and AppContext
* Routes.tsx - This is App and individual routes for the application
* serviceWorker.ts - The service worker
* setupProxy.js - Proxy configuration for development mode only

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
