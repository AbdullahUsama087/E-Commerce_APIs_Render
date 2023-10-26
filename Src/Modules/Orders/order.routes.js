import { Router } from "express";
import * as orderController from "./order.controller.js";
import * as orderValidation from "./order.validation.js";
import isAuth from "../../Middlewares/auth.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";
import orderAPIsRoles from "./order.endpoints.js";

const router = Router();

router.post(
  "/",
  isAuth(orderAPIsRoles.CREATE_ORDER),
  validationCoreFunction(orderValidation.createOrderValidation),
  asyncHandler(orderController.createOrder)
);

router.post(
  "/orderCart",
  isAuth(orderAPIsRoles.CREATE_ORDER),
  validationCoreFunction(orderValidation.orderFromCartValidation),
  asyncHandler(orderController.orderFromCart)
);
router.get("/successOrder", asyncHandler(orderController.successPayment));

router.patch("/cancelOrder", asyncHandler(orderController.cancelPayment));

export default router;
