import express, { Request, Response } from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";
import { getMultipleFilesPath, getSingleFilePath } from "../../../shared/getFilePath";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
const router = express.Router();

router.post(
  "/create",
  fileUploadHandler() as any,
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  async (req, res, next) => {
    try {
      const payload = req.body;
      const image = getMultipleFilesPath(req.files, "image");

      if (!image) {
        return res.status(400).json({ message: "Category image is required." });
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
  CategoryController.createCategory
);

router
  .route("/:id")
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    CategoryController.updateCategory
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    CategoryController.deleteCategory
  );

router.get(
  "/",
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
  CategoryController.getCategories
);

router.get(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
  CategoryController.getSingleCategory
);

export const CategoryRoutes = router;
