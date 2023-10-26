import { Router } from "express";
import multerCloudFunction from "../../Services/multerCloud.js";
import allowedExtensions from "../../Utils/allowedExtensions.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";
import * as productValidation from "./product.validation.js";
import * as productController from "./product.controller.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import isAuth from "../../Middlewares/auth.js";
const router = Router();

router.post(
  "/",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).array("image", 2),
  validationCoreFunction(productValidation.createProductValidation),
  asyncHandler(productController.createProduct)
);

router.put(
  "/",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).array("image", 2),
  validationCoreFunction(productValidation.updateProductValidation),
  asyncHandler(productController.updateProduct)
);

router.get("/", asyncHandler(productController.getAllProducts));

router.get("/title", asyncHandler(productController.getProductsByTitle));

router.get("/list", asyncHandler(productController.listProduct));

router.delete("/", isAuth(), asyncHandler(productController.deleteProduct));

export default router;
