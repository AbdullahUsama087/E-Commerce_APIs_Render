import { Router } from "express";
import { asyncHandler } from "../../Utils/errorHandling.js";
import multerCloudFunction from "../../Services/multerCloud.js";
import allowedExtensions from "../../Utils/allowedExtensions.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";

import * as categoryController from "./category.controller.js";
import * as categoryValidation from "./category.validation.js";
import subCategoryRouter from "../SubCategories/subCategory.routes.js";
import isAuth from "../../Middlewares/auth.js";
import systemRoles from "../../Utils/systemRoles.js";
import categoryAPIsRoles from "./category.endpoints.js";

const router = Router();
router.use("/:categoryId", subCategoryRouter);

router.post(
  "/",
  isAuth(categoryAPIsRoles.CREATE_CATEGORY),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(categoryValidation.createCategoryValidation),
  asyncHandler(categoryController.createCategory)
);
router.put(
  "/",
  isAuth(categoryAPIsRoles.UPDATE_CATEGORY),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(categoryValidation.updateCategoryValidation),
  asyncHandler(categoryController.updateCategory)
);
router.get("/", asyncHandler(categoryController.getAllCategories));

router.delete(
  "/",
  isAuth(categoryAPIsRoles.DELETE_CATEGORY),
  validationCoreFunction(categoryValidation.deleteCategoryValidation),
  asyncHandler(categoryController.deleteCategory)
);

export default router;
