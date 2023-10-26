import { Router } from "express";
import * as brandValidation from "./brand.validation.js";
import * as brandController from "./brand.controller.js";
import multerCloudFunction from "../../Services/multerCloud.js";
import allowedExtensions from "../../Utils/allowedExtensions.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import isAuth from "../../Middlewares/auth.js";
const router = Router();

router.post(
  "/",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("logo"),
  validationCoreFunction(brandValidation.createBrandValidation),
  asyncHandler(brandController.createBrand)
);
router.put(
  "/",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("logo"),
  validationCoreFunction(brandValidation.updateBrandValidation),
  asyncHandler(brandController.updateBrand)
);
router.get("/", asyncHandler(brandController.getAllBrands));

router.delete(
  "/",
  isAuth(),
  validationCoreFunction(brandValidation.deleteBrandValidation),
  asyncHandler(brandController.deleteBrand)
);

export default router;
