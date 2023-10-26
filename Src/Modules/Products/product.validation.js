import Joi from "joi";
import { generalFields } from "../../Middlewares/validation.js";

const createProductValidation = {
  body: Joi.object({
    title: Joi.string().min(7).max(60).required(),
    description: Joi.string().min(8).max(200).optional(),
    colors: Joi.array().items(Joi.string().required()).optional(),
    sizes: Joi.array().items(Joi.string().required()).optional(),
    price: Joi.number().positive().min(1).required(),
    appliedDiscount: Joi.number().positive().min(1).max(100).optional(),
    stock: Joi.number().integer().positive().min(1).required(),
  }),

  //
  query: Joi.object({
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
    brandId: generalFields.id,
  }).required(),
};

const updateProductValidation = {
  body: Joi.object({
    title: Joi.string().min(7).max(60).required(),
    description: Joi.string().min(8).max(200).optional(),
    price: Joi.number().positive().min(1).required(),
    appliedDiscount: Joi.number().positive().min(1).max(100).optional(),
    colors: Joi.array().items(Joi.string().required()).optional(),
    sizes: Joi.array().items(Joi.string().required()).optional(),
    stock: Joi.number().integer().positive().min(1).required(),
  }),

  //
  query: Joi.object({
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
    brandId: generalFields.id,
    productId: generalFields.id,
  }).required(),
};

const deleteProductValidation = {
  query: Joi.object({
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
    brandId: generalFields.id,
    productId: generalFields.id,
  }).required(),
};

export {
  createProductValidation,
  updateProductValidation,
  deleteProductValidation,
};
