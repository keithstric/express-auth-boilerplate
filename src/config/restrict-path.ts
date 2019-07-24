import { Request, Response, NextFunction } from 'express';

/**
 * Route Middleware to redirect to the login page if there isn't an established session
 * @param req {Request}
 * @param res {Response}
 * @param next {Function}
 */
const authReqMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (!req.isAuthenticated()) {
		res.status(401).send({message: 'Not Authenticated'});
	}else {
		next();
	}
};

export default authReqMiddleware;
