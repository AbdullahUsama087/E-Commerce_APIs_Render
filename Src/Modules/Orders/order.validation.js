import Joi from "joi";
import { generalFields } from "../../Middlewares/validation.js";

const createOrderValidation = {
  body: Joi.object({
    productId: generalFields.id,
    quantity: Joi.number().integer().positive().min(1).required(),
    address: Joi.string().min(5).required(),
    phoneNumbers: Joi.array()
      .items(Joi.string().length(11).required())
      .required(),
    paymentMethod: Joi.string().valid("Cash", "Card").required(),
    couponCode: Joi.string().optional(),
  }).required(),
};

const orderFromCartValidation = {
  body: Joi.object({
    address: Joi.string().min(5).required(),
    phoneNumbers: Joi.array()
      .items(Joi.string().length(11).required())
      .required(),
    paymentMethod: Joi.string().valid("Cash", "Card").required(),
    couponCode: Joi.string().optional(),
  }).required(),
  query: Joi.object({
    cartId: generalFields.id,
  }).required(),
};

export { createOrderValidation, orderFromCartValidation };