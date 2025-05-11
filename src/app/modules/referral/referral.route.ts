import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ReferralController } from './referral.controller';

const router = express.Router();
router.route('/')
.post(auth(USER_ROLES.ARTIST), ReferralController.createReferral)
.get(auth(), ReferralController.getReferrals)
router.route('/:id')
.get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ReferralController.getReferralById)

export const ReferralRoutes = router;