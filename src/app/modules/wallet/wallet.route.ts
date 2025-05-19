import express from 'express';
import auth from "../../middlewares/auth";
import { WalletController } from "./wallet.controller";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLES } from '../../../enums/user';
import { WalletValidation } from './wallet.validation';

const router = express.Router();

router.route("/")
    .get(auth(USER_ROLES.ARTIST), WalletController.getWallet)
    .post(auth(USER_ROLES.ARTIST),validateRequest(WalletValidation.createApplyWithdrawZodSchema), WalletController.applyForWidthdraw);

router.route('/withdraw')
    .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), WalletController.getAllWithdrawsData);

router.route('/earnings')
    .get(auth(USER_ROLES.ARTIST), WalletController.userEarnings);

router.route('/withdraw/:id')
    .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), WalletController.getSingleWithdraw)
    .patch(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),validateRequest(WalletValidation.createAcceptorRejectWithdrawZodSchema), WalletController.acceptOrRejectWithdraw);

export const WalletRoutes = router;