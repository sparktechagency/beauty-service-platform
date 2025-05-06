import express from "express";
import { ServiceManagementController } from "./servicemanagement.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { getSingleFilePath } from "../../../shared/getFilePath";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

// * create service management
router.get(
  "/",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler() as any,
  async (req, res, next) => {
    try {
      const data = req.body;
      const image = getSingleFilePath(req.files, "image");
      if (!image) {
        return res
          .status(400)
          .json({ message: "Sub-Category image is required." });
      }

      req.body = {
        ...data,
        image,
      };

      next();
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request data.");
    }
  },

  ServiceManagementController.createServiceManagement
);

// * get all service management
router.get(
  "/",
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ARTIST,
    USER_ROLES.USER
  ),
  ServiceManagementController.getAllServiceManagement
);

// * get single service management
router.get(
  "/:id",
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ARTIST,
    USER_ROLES.USER
  ),
  ServiceManagementController.getSingleServiceManagement
);

// * update service management
router.patch(
  "/:id",
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ARTIST,
    USER_ROLES.USER
  ),
  fileUploadHandler() as any,
  async (req, res, next) => {
    try {
      const data = req.body;
      const image = getSingleFilePath(req.files, "image");
      req.body = {
        ...data,
        image,
      };
      next();
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request data.");
    }
  }
);

// * delete service management

router.delete(
  "/:id",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ServiceManagementController.deleteServiceManagement
);

export const ServiceManagementRoutes = router;
