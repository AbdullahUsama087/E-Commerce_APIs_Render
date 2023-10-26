import { Router } from "express";

const router = Router();

import * as authController from "./auth.controller.js";
import { asyncHandler } from "../../Utils/errorHandling.js";

router.post("/", asyncHandler(authController.signUp));

router.get("/confirm/:token", asyncHandler(authController.confirmEmail));

router.post("/signIn", asyncHandler(authController.signIn));

router.post("/forget", asyncHandler(authController.forgetPassword));

router.get("/reset/:token", asyncHandler(authController.resetPassword));

export default router;
