const Joi = require("joi");

// Register Schema Function
const registerSchema = Joi.object({
  userName: Joi.string().required().messages({
    "string.empty": "userName is required.",
    "any.required": "userName is a mandatory field.",
  }),
  phone: Joi.string().required().messages({
    "string.empty": "Phone number is required.",
    "any.required": "Phone number is a mandatory field.",
  }),
  fcm: Joi.string().required().messages({
    "string.empty": "fcm is required.",
    "any.required": "fcm is a mandatory field.",
  }),
  serviceCity: Joi.string().required().messages({
    "string.empty": "Service city is required.",
    "any.required": "Service city is a mandatory field.",
  }),
  role: Joi.string().required().messages({
    "string.empty": "role is required.",
    "any.required": "role is a mandatory field.",
  }),
  profileImg:Joi.string().uri().required().optional().messages({
    "string.uri": "Profile image must be a valid URL.",
  }),
  password: Joi.string().min(6).max(200).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "string.max": "Password cannot exceed 200 characters.",
    "string.empty": "Password is required.",
    "any.required": "Password is a mandatory field.",
  }),
  experience: Joi.number().required().messages({
    "number.base": "Experience must be a number.",
    "any.required": "Experience is a mandatory field.",
  }),
  ratePerHour: Joi.number().required().messages({
    "number.base": "Rate per hour must be a number.",
    "any.required": "Rate per hour is a mandatory field.",
  }),
  availability: Joi.string().required().messages({
    "string.empty": "Work availability is required.",
    "any.required": "Work availability is a mandatory field.",
  }),
  services: Joi.array().items(Joi.string()).messages({
    "array.base": "Services must be an array.",
    "array.includes": "Each service must be a string.",
    "any.required": "Services are required.",
  }),
  cnic: Joi.string().uri().optional().messages({
    "string.uri": "CINC image must be a valid URL.",
    "any.required": "CINC is required.",
  }),
  criminalRecordCertificate: Joi.string().optional().uri().messages({
    "string.uri": "Criminal record certificate image must be a valid URL.",
    "any.required": "Criminal record certificate is required.",
  }),
}).unknown(false);

module.exports = { registerSchema };


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
  module.exports.maidSchema = async (payload) => {
      const schema = Joi.object({
        userName: Joi.string().required().messages({
          "string.empty": "userName is required.",
          "any.required": "userName is a mandatory field.",
        }),
        phone: Joi.string().required().messages({
          "string.empty": "Phone number is required.",
          "any.required": "Phone number is a mandatory field.",
        }),
        serviceCity: Joi.string().required().messages({
          "string.empty": "Service city is required.",
          "any.required": "Service city is a mandatory field.",
        }),
        profileImg:Joi.string().uri().required().optional().messages({
          "string.uri": "Profile image must be a valid URL.",
        }),
        experience: Joi.number().required().messages({
          "number.base": "Experience must be a number.",
          "any.required": "Experience is a mandatory field.",
        }),
        ratePerHour: Joi.number().required().messages({
          "number.base": "Rate per hour must be a number.",
          "any.required": "Rate per hour is a mandatory field.",
        }),
        availability: Joi.string().required().messages({
          "string.empty": "Work availability is required.",
          "any.required": "Work availability is a mandatory field.",
        }),
        services: Joi.array().items(Joi.string()).messages({
          "array.base": "Services must be an array.",
          "array.includes": "Each service must be a string.",
          "any.required": "Services are required.",
        }),
        cnic: Joi.string().uri().optional().messages({
          "string.uri": "CINC image must be a valid URL.",
          "any.required": "CINC is required.",
        }),
        criminalRecordCertificate: Joi.string().optional().uri().messages({
          "string.uri": "Criminal record certificate image must be a valid URL.",
          "any.required": "Criminal record certificate is required.",
        }),
      }).unknown(false);
    
      const result = schema.validate(payload);
      return result;
    };