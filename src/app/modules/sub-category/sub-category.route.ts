import express from "express";
import { SubCategoryController } from "./sub-category.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import validateRequest from "../../middlewares/validateRequest";
import { SubCategoryValidations } from "./sub-category.validation";
import { getSingleFilePath } from "../../../shared/getFilePath";

const router = express.Router();
// * Create sub-category
router.post(
  "/create",
  auth(USER_ROLES.SUPER_ADMIN),
  fileUploadHandler() as any,
  //   validateRequest(SubCategoryValidations.createSubCategoryZodSchema),
  async (req, res, next) => {
    try {
      const payload = req.body;
      const image = getSingleFilePath(req.files, "image");

      if (!image) {
        return res
          .status(400)
          .json({ message: "Sub-Category image is required." });
      }

      req.body = {
        ...payload,
        image,
      };

      next();
    } catch (error) {
      res.status(500).json({ message: "Failed to upload Image" });
    }
  },
  SubCategoryController.createSubCategory
);

// * Get all sub-categories
router.get(
  "/",
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.ARTIST,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.USER
  ),
  SubCategoryController.getAllSubCategory
);

// * Get single sub-category
router.get(
  "/:id",
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.ARTIST,
    USER_ROLES.USER
  ),
  SubCategoryController.getSingleSubCategory
);

// * Update sub-category
router.patch(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  fileUploadHandler() as any,
  validateRequest(SubCategoryValidations.updateSubCategoryZodSchema),
  async (req, res, next) => {
    try {
      const payload = req.body;
      const image = getSingleFilePath(req.files, "image");
      if (!image) {
        return res
          .status(400)
          .json({ message: "Sub-Category image is required." });
      }
      req.body = {
        ...payload,
        image,
      };
      next();
    } catch (error) {
      res.status(500).json({ message: "Failed to upload Image" });
    }
  },
  SubCategoryController.updateSubCategory
);

// * Delete sub-category
router.delete(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SubCategoryController.deleteSubCategory
);

export const SubCategoryRoutes = router;
