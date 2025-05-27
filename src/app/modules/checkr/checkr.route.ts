import expres from "express";
import validateRequest from "../../middlewares/validateRequest";
import { CheckrValidation } from "./checkr.validation";
import { CheckrController } from "./checkr.controller";

const router = expres.Router();

router.post("/",validateRequest(CheckrValidation.createCandidateZodSchema), CheckrController.createCandidate);

export  const CheckrRoutes = router;