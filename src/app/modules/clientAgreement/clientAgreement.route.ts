import { Router } from "express";
import { clientAgreementController } from "./clientAgreement.controller";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";

const route = Router();
//* create client agreement
route.post("/create",auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), clientAgreementController.createClientAgreement)

//* get all client agreement
route.get("/",auth(USER_ROLES.ADMIN, USER_ROLES.ARTIST, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), clientAgreementController.getAllClientAgreement)

// * get single client agreement
route.get("/:id",auth(USER_ROLES.ADMIN, USER_ROLES.ARTIST, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), clientAgreementController.getSingleClientAgreement)

//* update client agreement
route.patch("/:id",auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), clientAgreementController.updateClientAgreement)

//* delete client agreement
route.delete("/:id",auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), clientAgreementController.deleteClientAgreement)

export const clientAgreementRoute = route;