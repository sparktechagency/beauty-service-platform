import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ReviewController } from "./review.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";
const router = express.Router();

router.route('/')
.post(
    auth(USER_ROLES.USER),
    validateRequest(ReviewValidation.reviewZodSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {rating, ...othersData } = req.body;
            const user:any  = req.user;
            req.body = { ...othersData, user: user.id, rating: Number(rating)};
            next();

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Failed to convert string to number" });
        }
    },
    ReviewController.createReview
)
.get(
    auth(USER_ROLES.USER,USER_ROLES.ARTIST),
    validateRequest(ReviewValidation.getAllReviewsZodSchema),
    ReviewController.getAllReviews
)

router.route('/:id')
.get(
    auth(USER_ROLES.USER,USER_ROLES.ARTIST),
    ReviewController.getAllReviewsByOrder
)



export const ReviewRoutes = router;