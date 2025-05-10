import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
const router = express.Router();

router.get(
    '/profile',
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    UserController.getUserProfile
);
  
router.post(
    '/create-admin',
    validateRequest(UserValidation.createAdminZodSchema),
    UserController.createAdmin
);

router.post(
    '/create-stripe-account',
    auth(USER_ROLES.ARTIST),
    UserController.createStripeAccount
);

router
    .route('/')
    .post(
        UserController.createUser
    )
    .patch(
        auth(USER_ROLES.ADMIN, USER_ROLES.USER),
        fileUploadHandler(),
        UserController.updateProfile
    ).get(
        auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
        UserController.getUsers
    );

export const UserRoutes = router;