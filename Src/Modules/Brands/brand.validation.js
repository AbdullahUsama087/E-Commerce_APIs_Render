import joi from "joi";
import { generalFields } from "../../Middlewares/validation.js";

const createBrandValidation = {
  body: joi
    .object({
      name: joi.string().min(3).max(22),
    })
    .required()
    .options({ presence: "required" }),
  query: joi
    .object({
      categoryId: generalFields.id,
      subCategoryId: generalFields.id,
    })
    .required(),
};

const updateBrandValidation = {
  body: joi
    .object({
      name: joi.string().min(3).max(22),
    })
    .required(),
  query: joi
    .object({
      categoryId: generalFields.id,
      subCategoryId: generalFields.id,
      brandId: generalFields.id,
    })
    .required(),
};

const deleteBrandValidation = {
  query: joi
    .object({
      categoryId: generalFields.id,
      subCategoryId: generalFields.id,
      brandId: generalFields.id,
    })
    .required(),
};

export { createBrandValidation, updateBrandValidation, deleteBrandValidation };
