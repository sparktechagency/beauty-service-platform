import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { clientAgreementRoute } from "../modules/clientAgreement/clientAgreement.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { SubCategoryRoutes } from "../modules/sub-category/sub-category.route";
import { ServiceManagementRoutes } from "../modules/servicemanagement/servicemanagement.route";
import { UserTakeServiceRoutes } from "../modules/usertakeservice/usertakeservice.route";
import { NotificationRoutes } from "../modules/notification/notification.routes";
import { PlanRoutes } from "../modules/plan/plan.route";
import { SubscriptionRoutes } from "../modules/subscription/subscription.routes";
import { ReferralRoutes } from "../modules/referral/referral.route";
import { WalletRoutes } from "../modules/wallet/wallet.route";
import { ReviewRoutes } from "../modules/review/review.routes";
const router = express.Router();

const apiRoutes = [
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/clientAgreement", route: clientAgreementRoute },
  { path: "/plan", route: PlanRoutes },
  { path: "/subscription", route: SubscriptionRoutes },
  { path: "/category", route: CategoryRoutes },
  { path: "/subCategory", route: SubCategoryRoutes },
  { path: "/serviceManagement", route: ServiceManagementRoutes },
  { path: "/service", route: UserTakeServiceRoutes },
  { path: "/referral", route: ReferralRoutes },
  { path: "/notification", route: NotificationRoutes },
  { path: "/wallet", route: WalletRoutes },
  {path:"/review",route:ReviewRoutes}
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
