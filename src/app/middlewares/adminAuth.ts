import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import { jwtHelper } from '../../helpers/jwtHelper';
import ApiError from '../../errors/ApiErrors';
import { ADMIN_BADGE, USER_ROLES } from '../../enums/user';
import { User } from '../modules/user/user.model';

const adminAuth = (badge:string[]=[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tokenWithBearer = req.headers.authorization;
      
        
        if (!tokenWithBearer) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
        }
  
        if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
            const token = tokenWithBearer.split(' ')[1];

            
            
            //verify token
            const verifyUser = jwtHelper.verifyToken(
                token,
                config.jwt.jwt_secret as Secret
            );

            req.user = verifyUser;
           
            
            if (!verifyUser) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
            }
            badge?.push(ADMIN_BADGE.AH_EXECUTTIVE);

            if(![USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(verifyUser.role)){
                throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
            }
  
            next();
        }
    } catch (error) {
        next(error);
    }
}
export default adminAuth;