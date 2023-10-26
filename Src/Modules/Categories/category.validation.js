import joi from "joi";
import { generalFields } from "../../Middlewares/validation.js";

const createCategoryValidation = {
  body: joi
    .object({
      name: joi.string().min(4).max(12),
    })
    .required()
    .options({ presence: "required" }),
};

const updateCategoryValidation = {
  body: joi
    .object({
      name: joi.string().min(4).max(12).optional(),
    })
    .required(),
};
const deleteCategoryValidation = {
  query: joi
    .object({
      categoryId: generalFields.id,
    })
    .required(),
};

export {
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
};
