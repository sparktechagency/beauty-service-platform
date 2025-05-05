import express from 'express';
import { ClientResponsibilityController } from './clientresponsibility.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
// * create client responsibility
router.post('/',auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ClientResponsibilityController.createClientResponsibility); 


// * get all client responsibility
router.get('/',auth(USER_ROLES.ADMIN, USER_ROLES.ARTIST, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), ClientResponsibilityController.getAllClientResponsibility);



// * get single client responsibility
router.get('/:id',auth(USER_ROLES.ADMIN, USER_ROLES.ARTIST, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), ClientResponsibilityController.getSingleClientResponsibility);


// * update client responsibility
router.patch('/:id',auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ClientResponsibilityController.updateClientResponsibility);


// * delete client responsibility
router.delete('/:id',auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ClientResponsibilityController.deleteClientResponsibility);

export const ClientResponsibilityRoutes = router;
