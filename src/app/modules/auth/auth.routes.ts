import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
    '/login',
    validateRequest(AuthValidation.createLoginZodSchema),
    AuthController.loginUser
);

router.post(
    '/forgot-password',
    validateRequest(AuthValidation.createForgetPasswordZodSchema),
    AuthController.forgetPassword
);

router.post(
    '/refresh-token',
    AuthController.newAccessToken
);

router.post(
    '/verify-email',
    validateRequest(AuthValidation.createVerifyEmailZodSchema),
    AuthController.verifyEmail
  );




router.post(
    '/reset-password',
    validateRequest(AuthValidation.createResetPasswordZodSchema),
    AuthController.resetPassword
);

router.post(
    '/change-password',
    auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.ARTIST,USER_ROLES.SUPER_ADMIN),
    AuthController.changePassword
);

router.post(
    '/resend-otp',
    AuthController.resendVerificationEmail
);

router.post(
    '/social-login',
    AuthController.socialLogin
);

router.delete(
    '/delete-account',
    auth(USER_ROLES.ADMIN),
    AuthController.deleteUser
);



export const AuthRoutes = router;