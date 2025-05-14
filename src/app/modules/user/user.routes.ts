import express from "express";
import { USER_ROLES } from "../../../enums/user";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from "../../../shared/getFilePath";
const router = express.Router();

router.get("/profile", auth(), UserController.getUserProfile);
router.post(
  "/",
  fileUploadHandler() as any,
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
        console.log("req.body", req.body);
        next();
      } catch (error) {
        res.status(500).json({ message: "Failed to upload Image" });
      }
    },
    UserController.updateProfile
  )
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.USER,
      USER_ROLES.ARTIST
    ),
    UserController.getUsers
  );

export const UserRoutes = router;
