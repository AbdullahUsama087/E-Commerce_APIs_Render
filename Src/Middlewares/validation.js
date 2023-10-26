import Joi from "joi";
import { Types } from "mongoose";

const reqMethods = ["body", "query", "params", "headers", "file", "files"];

const validationObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message("Invalid ID");
};

const generalFields = {
  email: Joi.string()
    .email({ tlds: { allow: ["com", "net", "org"] } })
    .required(),
  password: Joi.string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .messages({ "string.pattern.base": "Password regex Fail" })
    .required(),
  id: Joi.string().custom(validationObjectId),
};

const validationCoreFunction = (schema) => {
  return (req, res, next) => {
    const validationErrArr = [];
    for (const key of reqMethods) {
      if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        });
        if (validationResult.error) {
          validationErrArr.push(validationResult.error.details);
        }
      }
    }
    if (validationErrArr.length) {
      //   res
      //     .status(400)
      //     .json({ message: "Validation Error", Errors: validationErrArr });

      req.validationErrArr = validationErrArr;
      next(new Error(""), { cause: 400 });
    } else {
      next();
    }
  };
};

export { validationCoreFunction, generalFields };
