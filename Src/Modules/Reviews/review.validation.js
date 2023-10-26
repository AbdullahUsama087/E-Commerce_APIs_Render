import Joi from "joi";
import { generalFields } from "../../Middlewares/validation.js";




const addReviewValidation={
    query:Joi.object({
        productId:generalFields.id.required()
    }).required(),
    body:Joi.object({
        reviewRate:Joi.number().positive().min(1).max(5).required(),
        reviewComment:Joi.string().min(5).max(255).optional()
    }).required()
}


export{addReviewValidation}