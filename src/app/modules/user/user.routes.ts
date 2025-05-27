import express from "express";
import { ADMIN_BADGE, USER_ROLES } from "../../../enums/user";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from "../../../shared/getFilePath";
import adminAuth from "../../middlewares/adminAuth";
const router = express.Router();

router.get("/profile", auth(), UserController.getUserProfile);
router.post(
  "/",
  validateRequest(UserValidation.createUserZodSchema),
  async (req, res, next) => {
    try {
      const { ...payload } = req.body;

      // Validate required fields
      if (!payload) {
        return res.status(400).json({
          message:
            "Missing required fields: password, email, role, name, or contact.",
        });
      }

      // Handle background image (single file) and work images (multiple files)
      const backGroundImage = getSingleFilePath(req.files, "backGroundImage");
      const workImage = getMultipleFilesPath(req.files, "workImage");

      // Update req.body with image paths
      req.body = {
        ...req.body,
        backGroundImage,
        workImage,
      };
      next();
    } catch (error) {
      // Log any errors and send a generic error message
      console.error("Error during file upload or validation:", error);
      res
        .status(500)
        .json({ message: "Failed to upload image or process fields." });
    }
  },
  UserController.createUser
);
router.post(
  "/create-stripe-account",
  auth(USER_ROLES.ARTIST),
  UserController.createStripeAccount
);

router
  .route("/")
  .patch(
    auth(),
    fileUploadHandler(),
    async (req, res, next) => {
      try {
        const { ...payload } = req.body;
        const profile = getSingleFilePath(req.files, "profile");
        req.body = {
          profile: profile,
          ...payload,
        };
   
        next();
      } catch (error) {
        res.status(500).json({ message: "Failed to upload Image" });
      }
    },
    UserController.updateProfile
  )
  .get(
    adminAuth([ADMIN_BADGE.AH_ENGAGEMENT,ADMIN_BADGE.AH_CARE]),
    UserController.getUsers
  )
  .delete(
    auth(),
    validateRequest(UserValidation.createDeletePasswordZodSchema),
    UserController.deleteAccount
  );

router.route('/user/:id')
  .get(
    adminAuth([ADMIN_BADGE.AH_ENGAGEMENT,ADMIN_BADGE.AH_CARE]),
    UserController.getUserById
  )
  .patch(
    adminAuth([ADMIN_BADGE.AH_ENGAGEMENT,ADMIN_BADGE.AH_CARE]),
    UserController.updateUserById
  );

router.patch(
  "/add-category/:id",
  validateRequest(UserValidation.addCategoriesZodSchema),
  UserController.addCategories
)

export const UserRoutes = router;
