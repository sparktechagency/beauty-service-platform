import { Router } from "express";
import { clientAgreementController } from "./clientAgreement.controller";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ClientAgreementValidation } from "./clientAgreement.validation";

const route = Router();
//* create client agreement
route.post("/",auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),validateRequest(ClientAgreementValidation.createClientAgreementZodSchema), clientAgreementController.createClientAgreement)

//* get all client agreement
route.get("/", clientAgreementController.getAllClientAgreement)


export const clientAgreementRoute = route;