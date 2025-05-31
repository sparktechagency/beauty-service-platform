import expres from "express";
import validateRequest from "../../middlewares/validateRequest";
import { CheckrValidation } from "./checkr.validation";
import { CheckrController } from "./checkr.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const router = expres.Router();

router.post("/",validateRequest(CheckrValidation.createCandidateZodSchema), CheckrController.createCandidate);
router.post("/reports",CheckrController.createReport)
router.post("/document/:id",fileUploadHandler(),validateRequest(CheckrValidation.uploadDocuments),CheckrController.postCandidateDocument)

export  const CheckrRoutes = router;