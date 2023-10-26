import { Router } from "express";
import multerCloudFunction from "../../Services/multerCloud.js";
import allowedExtensions from "../../Utils/allowedExtensions.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Utils/errorHandling.js";

import * as subCategoryController from "./subCategory.controller.js";
import * as subCategoryValidation from "./subCategory.validation.js";
import isAuth from "../../Middlewares/auth.js";
const router = Router({ mergeParams: true });

router.post(
  "/",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(subCategoryValidation.createSubCategoryValidation),
  asyncHandler(subCategoryController.createSubCategory)
);
router.put(
  "/",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(subCategoryValidation.updateSubCategoryValidation),
  asyncHandler(subCategoryController.updateSubCategory)
);

router.get("/", asyncHandler(subCategoryController.getAllSubCategories));

router.delete(
  "/",
  isAuth(),
  validationCoreFunction(subCategoryValidation.deleteSubCategoryValidation),
  asyncHandler(subCategoryController.deleteSubCategory)
);

export default router;
