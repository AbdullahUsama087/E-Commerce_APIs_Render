import Joi from "joi";
import { generalFields } from "../../Middlewares/validation.js";

const createCouponValidation = {
  body: Joi.object({
    couponCode: Joi.string().min(5).max(10).required(),
    couponAmount: Joi.number().positive().min(1).max(100).required(),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
    isPercentage: Joi.boolean().optional(),
    isFixedAmount: Joi.boolean().optional(),
    couponAssignedToUsers: Joi.array().items().required(),
  }).required(),
};

const updateCouponValidation = {
  body: Joi.object({
    couponCode: Joi.string().min(5).max(10).optional(),
    couponAmount: Joi.number().positive().min(1).max(100).optional(),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .optional(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).optional(),
    isPercentage: Joi.boolean().optional(),
    isFixedAmount: Joi.boolean().optional(),
    couponAssignedToUsers: Joi.array().items().optional(),
  }).required(),
  query: Joi.object({
    couponId: generalFields.id,
  }).required(),
};

const deleteCouponValidation = {
  query: Joi.object({
    couponId: generalFields.id,
  }).required(),
};

export {
  createCouponValidation,
  updateCouponValidation,
  deleteCouponValidation,
};
