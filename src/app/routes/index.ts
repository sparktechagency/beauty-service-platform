import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { clientAgreementRoute } from '../modules/clientAgreement/clientAgreement.route';
import { ClientResponsibilityRoutes } from '../modules/clientresponsibility/clientresponsibility.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { SubCategoryRoutes } from '../modules/sub-category/sub-category.route';
import { ServiceManagementRoutes } from '../modules/servicemanagement/servicemanagement.route';
import { PlanRoutes } from '../modules/plan/plan.route';
import { SubscriptionRoutes } from '../modules/subscription/subscription.routes';
import { ReferralRoutes } from '../modules/referral/referral.route';
import { WalletRoutes } from '../modules/wallet/wallet.route';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/clientAgreement", route: clientAgreementRoute},
    { path: "/clientResponsibility", route: ClientResponsibilityRoutes},
    {path:"/plan",route:PlanRoutes},
    {path:"/subscription",route:SubscriptionRoutes},
    {path:"/category", route:CategoryRoutes},
    {path:"/subCategory", route:SubCategoryRoutes},
    {path:"/serviceManagement", route:ServiceManagementRoutes},
    {path:"/referral", route:ReferralRoutes},
    {path:"/wallet", route:WalletRoutes},
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;