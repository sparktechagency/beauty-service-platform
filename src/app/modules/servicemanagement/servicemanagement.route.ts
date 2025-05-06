import express from "express";
import { ServiceManagementController } from "./servicemanagement.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { getSingleFilePath } from "../../../shared/getFilePath";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

// * create service management
router.get(
  "/",
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
router.get("/", ServiceManagementController.getAllServiceManagement);

// * get single service management
router.get("/:id", ServiceManagementController.getSingleServiceManagement);

// * update service management
router.patch(
  "/:id",
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
)

// * delete service management

router.delete("/:id", ServiceManagementController.deleteServiceManagement);


export const ServiceManagementRoutes = router;
