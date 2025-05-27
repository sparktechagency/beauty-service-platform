import express from 'express';
import { ADMIN_BADGE, USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ReferralController } from './referral.controller';
import adminAuth from '../../middlewares/adminAuth';

const router = express.Router();
router.route('/')
.get(auth(), ReferralController.getReferralsForUser)
router.route('/all-referral')
.get(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    adminAuth([ADMIN_BADGE.AH_ENGAGEMENT]),
    ReferralController.getAllReferrals
)
router.route('/:id')
.get(adminAuth([ADMIN_BADGE.AH_ENGAGEMENT]), ReferralController.getReferralById)

export const ReferralRoutes = router;