import joi from "joi";
import { generalFields } from "../../Middlewares/validation.js";

const createSubCategoryValidation = {
  body: joi
    .object({
      name: joi.string().min(4).max(20),
    })
    .required()
    .options({ presence: "required" }),

  //
  params: joi
    .object({
      categoryId: generalFields.id,
    })
    .required(),
};

const updateSubCategoryValidation = {
  body: joi
    .object({
      name: joi.string().min(4).max(20),
    })
    .required(),

  //
  query: joi
    .object({
      categoryId: generalFields.id,
      subCategoryId: generalFields.id,
    })
    .required(),
};

const deleteSubCategoryValidation = {
  query: joi
    .object({
      categoryId: generalFields.id,
      subCategoryId: generalFields.id,
    })
    .required()
    .options({ presence: "required" }),
};

export {
  createSubCategoryValidation,
  updateSubCategoryValidation,
  deleteSubCategoryValidation,
};
