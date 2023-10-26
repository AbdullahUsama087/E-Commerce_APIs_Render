import { Router } from "express";
import * as cartController from "./cart.controller.js";
import * as cartValidation from "./cart.validation.js";
import isAuth from "../../Middlewares/auth.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";

const router = Router();

router.post(
  "/",
  isAuth(),
  validationCoreFunction(cartValidation.addToCartValidation),
  asyncHandler(cartController.addToCart)
);

router.delete(
  "/",
  isAuth(),
  validationCoreFunction(cartValidation.deleteFromCartValidation),
  asyncHandler(cartController.deleteFromCart)
);

export default router;
