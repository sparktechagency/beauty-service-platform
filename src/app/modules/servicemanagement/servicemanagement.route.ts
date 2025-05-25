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
router.post(
  "/create",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler() as any,
  async (req, res, next) => {
    try {
      const data = req.body;
      const image = getSingleFilePath(req.files, "image");
      if (!image) {
        return res
          .status(400)
          .json({ message: "Service image is required." });
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
router.route("/:id")
  .get(
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ARTIST,
    USER_ROLES.USER
  ),
  ServiceManagementController.getSingleServiceManagement
).patch(
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ARTIST,
    USER_ROLES.USER
  ),
  fileUploadHandler(),
  async (req, res, next) => {
    try {
      const data = req.body;
      const image = getSingleFilePath(req.files, "image");
      const addOns = req.body.addOns;
      if(addOns){
        req.body.addOns = JSON.parse(addOns)
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
  ServiceManagementController.updateServiceManagement
).delete(
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ServiceManagementController.deleteServiceManagement
);

export const ServiceManagementRoutes = router;
