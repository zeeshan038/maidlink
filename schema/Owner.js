// NPM package
const Joi = require("joi");

//Signup Schma
module.exports.registerSchema = (payload) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Name is required.",
      "any.required": "Name is a mandatory field.",
    }),
    userName: Joi.string().required().messages({
      "string.empty": "userName is required.",
      "any.required": "userName is a mandatory field.",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address.",
      "string.empty": "Email is required.",
      "any.required": "Email is a mandatory field.",
    }),
    fcm: Joi.string().required().messages({
      "string.empty": "fcm is required.",
      "any.required": "fcm is a mandatory field.",
    }),
    role: Joi.string().required().messages({
      "string.empty": "role is required.",
      "any.required": "role is a mandatory field.",
    }),
    phone: Joi.string().required().messages({
      "string.empty": "Phone number is required.",
      "any.required": "Phone number  is a mandatory field.",
    }),
    homeAddress: Joi.string().required().messages({
      "string.empty": "Address is required.",
      "any.required": "Address is a mandatory field.",
    }),
    profileImg: Joi.string().uri().messages({
      "string.uri": "Profile image must be a valid URL.",
    }),
    password: Joi.string().min(6).max(200).required().messages({
      "string.min": "Password must be at least 6 characters long.",
      "string.max": "Password cannot exceed 200 characters.",
      "string.empty": "Password is required.",
      "any.required": "Password is a mandatory field.",
    }),
  }).unknown(false);

  const result = schema.validate(payload);
  return result;
};

//loginup Schma
module.exports.loginSchema = (payload) => {
  const schema = Joi.object({
    userName: Joi.string().required().messages({
      "string.empty": "userName is required.",
      "any.required": "userName is a mandatory field.",
    }),
    password: Joi.string().min(6).max(200).required().messages({
      "string.min": "Password must be at least 6 characters long.",
      "string.max": "Password cannot exceed 200 characters.",
      "string.empty": "Password is required.",
      "any.required": "Password is a mandatory field.",
    }),
  }).unknown(false);

  const result = schema.validate(payload);
  return result;
};

//password schema
module.exports.passwordSchema = (payload) => {
  const schema = Joi.object({
    currentPassword: Joi.string().min(6).max(1024).required().messages({
      "string.empty": "Current password is required",
      "string.min":
        "Current password must be at least {#limit} characters long",
      "string.max": "Current password cannot exceed {#limit} characters",
      "any.required": "Current password is required",
    }),
    newPassword: Joi.string().min(6).max(1024).required().messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least {#limit} characters long",
      "string.max": "New password cannot exceed {#limit} characters",
      "any.required": "New password is required",
    }),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "New password and confirm new password must match",
        "any.required": "Confirm new password is required",
      }),
  }).unknown(false);

  const validationResult = schema.validate(payload);
  return validationResult;
};

// user schema
module.exports.ownerSchema = async (payload) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Name is required.",
      "any.required": "Name is a mandatory field.",
    }),
    userName: Joi.string().required().messages({
      "string.empty": "userName is required.",
      "any.required": "userName is a mandatory field.",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address.",
      "string.empty": "Email is required.",
      "any.required": "Email is a mandatory field.",
    }),
    phone: Joi.string().required().messages({
      "string.empty": "Phone number is required.",
      "any.required": "Phone number  is a mandatory field.",
    }),
    homeAddress: Joi.string().required().messages({
      "string.empty": "Address is required.",
      "any.required": "Address is a mandatory field.",
    }),
    profileImg: Joi.string().uri().messages({
      "string.uri": "Profile image must be a valid URL.",
    }),
    password: Joi.string().min(6).max(200).required().messages({
      "string.min": "Password must be at least 6 characters long.",
      "string.max": "Password cannot exceed 200 characters.",
      "string.empty": "Password is required.",
      "any.required": "Password is a mandatory field.",
    }),
  }).unknown(false);

  const result = schema.validate(payload);
  return result;
};
