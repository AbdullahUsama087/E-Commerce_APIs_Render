import { Router } from "express";

import * as reviewController from "./review.controller.js";
import * as reviewValidation from "./review.validation.js";
import isAuth from "../../Middlewares/auth.js";
import reviewAPIsRoles from "./review.endpoints.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Utils/errorHandling.js";

const router = Router();

router.post(
  "/",
  isAuth(reviewAPIsRoles.ADD_REVIEW),
  validationCoreFunction(reviewValidation.addReviewValidation),
  asyncHandler(reviewController.addReview)
);

export default router;
