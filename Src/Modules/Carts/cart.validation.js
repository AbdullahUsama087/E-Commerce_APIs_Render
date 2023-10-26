import Joi from "joi";
import { generalFields } from "../../Middlewares/validation.js";

const addToCartValidation = {
  body: Joi.object({
    productId: generalFields.id,
    quantity: Joi.number().integer().positive().min(1).required(),
  }).required(),
};

const deleteFromCartValidation = {
  body: Joi.object({
    productId: generalFields.id,
  }).required(),
};

export { addToCartValidation, deleteFromCartValidation };
