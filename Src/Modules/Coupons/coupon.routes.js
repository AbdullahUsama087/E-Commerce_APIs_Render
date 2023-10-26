import { Router } from "express";

const router = Router();
import * as couponController from "./coupon.controller.js";
import * as couponValidation from "./coupon.validation.js";
import { validationCoreFunction } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import isAuth from "../../Middlewares/auth.js";
import couponAPIsRoles from "./coupon.endpoints.js";

router.post(
  "/",
  isAuth(couponAPIsRoles.CREATE_COUPON),
  validationCoreFunction(couponValidation.createCouponValidation),
  asyncHandler(couponController.createCoupon)
);

router.put(
  "/",
  isAuth(couponAPIsRoles.UPDATE_COUPON),
  validationCoreFunction(couponValidation.updateCouponValidation),
  asyncHandler(couponController.updateCoupon)
);

router.get("/", asyncHandler(couponController.getAllCoupons));

router.delete(
  "/",
  isAuth(),
  validationCoreFunction(couponValidation.deleteCouponValidation),
  asyncHandler(couponController.deleteCoupon)
);

export default router;
