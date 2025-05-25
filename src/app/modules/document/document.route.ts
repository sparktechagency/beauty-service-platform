import express from "express";
import { DocumentController } from "./document.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { DocumentValidations } from "./document.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const router = express.Router();

router.route("/")
  .post(
    fileUploadHandler(),
    validateRequest(DocumentValidations.createDocumentZodSchema),
    DocumentController.createDocument
  )
  .get(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    DocumentController.getALlDocumentofUser
  );

router.route("/user")
  .get(
    auth(USER_ROLES.ARTIST),
    DocumentController.getAllUserDocuments
  );

router.route("/:id")
  .patch(
    auth(USER_ROLES.ARTIST,USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    fileUploadHandler(),
    validateRequest(DocumentValidations.createDocumentZodSchema),
    DocumentController.updateDocument
  )
  .delete(
    auth(USER_ROLES.ARTIST,USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    DocumentController.deleteDocument
  );

export const DocumentRoutes = router;