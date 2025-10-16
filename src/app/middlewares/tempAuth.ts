import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import { jwtHelper } from '../../helpers/jwtHelper';
import ApiError from '../../errors/ApiErrors';
import { User } from '../modules/user/user.model';

const tempAuth = (...roles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tokenWithBearer = req.headers.authorization;
      
        if(!tokenWithBearer || !tokenWithBearer.startsWith('Bearer')){

            
           return next()
        }


            const token = tokenWithBearer?.split(' ')[1];
            if(token){
                         //verify token
            const verifyUser = jwtHelper.verifyToken(
                token!,
                config.jwt.jwt_secret as Secret
            );

            //set user to header
            req.user = verifyUser;
            }
            next();
        
    } catch (error) {
        next()
    }
}
export default tempAuth;