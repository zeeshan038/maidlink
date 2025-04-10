const Joi = require("joi");

module.exports.orderSchema = (payload) => {
  const schema = Joi.object({
    location: Joi.array().items(Joi.number()).length(2).required().messages({
      "array.base": "Location must be an array of coordinates.",
      "array.length":
        "Location must contain exactly 2 coordinates (latitude, longitude).",
      "any.required": "Location is a mandatory field.",
    }),
    duration: Joi.string().required().messages({
      "string.empty": "Duration is required.",
      "any.required": "Duration is a mandatory field.",
    }),
    jobType: Joi.string().required().messages({
      "string.empty": "Job type is required.",
      "any.required": "Job type is a mandatory field.",
    }),
    charges: Joi.number().required().messages({
      "number.base": "Price must be a number.",
      "any.required": "Price is a mandatory field.",
    }),
    status: Joi.string()
      .valid("pending", "completed", "canceled")
      .default("pending")
      .messages({
        "any.only":
          "Status must be one of 'pending', 'completed', or 'canceled'.",
      }),
  }).unknown(false);

  const result = schema.validate(payload);
  return result;
};
