//NPM Packages
const bcrypt = require("bcrypt");

//utils
const { uploadFile } = require("../utils/cloudnary");

//Models
const Maid = require("../models/maid");

//Schama
const {
  registerSchema,
  loginSchema,
  passwordSchema,
  maidSchema,
} = require("../schema/Maid");

const genrateToken = require("../utils/genrateToken");
const sendOTP = require("../utils/otpcode");
const otp = require("../models/otp");

/**
 * @desciption maid registeration
 * @route POST /api/user/register
 * @access Public
 */
module.exports.register = async (req, res) => {
  const payload = req.body;

  // Ensure services is an array
  if (typeof payload.services === "string") {
    try {
      payload.services = JSON.parse(payload.services);
    } catch (error) {
      return res
        .status(400)
        .json({ status: false, msg: "Invalid services format" });
    }
  }

  // Validate input data
  const result = registerSchema.validate(payload);
  if (result.error) {
    const errors = result.error.details.map((detail) => detail.message);
    return res.status(400).json({ status: false, msg: errors });
  }

  try {
    // Check if user already exists
    const existingUser = await Maid.findOne({ userName: payload.userName });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, msg: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Check and upload profile image if it exists
    let profileImgUrl = "";
    if (req.files?.profileImg?.[0]) {
      profileImgUrl = await uploadFile(req.files.profileImg[0].path);
    }

    // Similarly check for other files
    let cnicUrl = "";
    console.log("cnic", cnicUrl);

    if (req.files?.cnic?.[0]) {
      cnicUrl = await uploadFile(req.files.cnic[0].path);
      console.log("cnic", cnicUrl);
    }

    console.log("cnic", cnicUrl);

    let criminalRecordUrl = "";
    if (req.files?.criminalRecordCertificate?.[0]) {
      criminalRecordUrl = await uploadFile(
        req.files.criminalRecordCertificate[0].path
      );
    }

    // Save user to database
    await Maid.create({
      userName: payload.userName,
      email: payload.email,
      phone: payload.phone,
      password: hashedPassword,
      serviceCity: payload.serviceCity,
      experience: payload.experience,
      ratePerHour: payload.ratePerHour,
      availability: payload.availability,
      services: payload.services,
      profileImg: profileImgUrl,
      cnic: cnicUrl,
      role : payload.role,
      criminalRecordCertificate: criminalRecordUrl,
    });

    return res
      .status(201)
      .json({ status: true, msg: "Maid Registered Successfully!" });
  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};

/**
 * @desciption login maid
 * @route POST /api/user/login
 * @access Public
 */
module.exports.login = async (req, res) => {
  const payload = req.body;

  //Error Handling
  const result = loginSchema(payload);
  if (result.error) {
    const errors = result.error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: false,
      msg: errors,
    });
  }

  try {
    //Checking valid user
    const validUser = await Maid.findOne({ userName: payload.userName }).select(
      "password"
    );

    const user = await Maid.findOne({userName: payload.userName });
   
  
    if (!validUser) {
      return res.status(401).json({
        status: false,
        msg: "userName  or Password is incorrect",
      });
    }

    //Checking password
    const validPassword = await bcrypt.compareSync(
      payload.password,
      validUser.password
    );
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        msg: "Email or Password is incorrect",
      });
    }

    const token = genrateToken(validUser._id);

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
      })
      .json({
        status: true,
        message: "User Logged In Successfully!",
        role : user.role,
        id: validUser._id,
        token,
      });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 * @desciption Forgot Password
 * @route POST /api/user/forgot-password
 * @access Public
 */
module.exports.forgotPassword = async (req, res) => {
  const { phone } = req.body;
  console.log("Phone" , phone)

  try {
    // Check if the user exists
    const user = await Maid.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        status: false,
        msg: "User not found",
      });
    }

    // Generate and send OTP
    const response = await sendOTP(phone);
    if (response.success) {
      // Store OTP in the database with an expiration time
      await otp.create({ phone, otp: response.otp });

      return res.status(200).json({
        status: true,
        otp: response.otp,
        msg: "OTP sent successfully",
      });
    } else {
      return res.status(500).json({ message: response.message });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 * @desciption Reset Password
 * @route PUT /api/user/reset-password
 * @access Public
 */
module.exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { phone } = req.params;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      status: false,
      msg: "All fields are required",
    });
  }
  if (newPassword.length < 6 || confirmPassword.length < 6) {
    return res.status(400).json({
      status: false,
      msg: "Password must be greater than 6 characters",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: false,
      msg: "Passwords do not match",
    });
  }

  try {
    const user = await Maid.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        status: false,
        msg: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Maid.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
      }
    );

    return res.status(200).json({
      status: true,
      msg: "Password reset successfull",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 *  @description Change password
 *  @route PUT /api/user/change-password
 *  @access Private
 */
module.exports.changePassword = async (req, res) => {
  const { _id } = req.maid;
  const payload = req.body;
  //Error Handling
  const result = passwordSchema(payload);
  if (result.error) {
    const errors = result.error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: false,
      msg: errors,
    });
  }

  console.log("pass", payload);
  try {
    const user = await Maid.findById(_id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: false,
        msg: "User not found",
      });
    }

    // Compare current password with the stored hashed password
    const matchPassword = await bcrypt.compare(
      payload.currentPassword,
      user.password
    );
    if (!matchPassword) {
      return res.status(400).json({
        status: false,
        msg: "Invalid Current Password",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.newPassword, salt);

    // Update the user's password
    await Maid.updateOne({ _id }, { password: hashedPassword });

    return res.status(200).json({
      status: true,
      msg: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 *  @description Update Profile
 *  @route PUT /api/user/edit-profile
 *  @access Private
 */
module.exports.editProfile = async (req, res) => {
  const { _id } = req.maid;
  let payload = req.body;

  // Upload new images if provided
  try {
    if (req.files?.profileImg?.[0]) {
      payload.profileImg = await uploadFile(req.files.profileImg[0].path);
    }

    if (req.files?.cnic?.[0]) {
      payload.cnic = await uploadFile(req.files.cnic[0].path);
    }

    if (req.files?.criminalRecordCertificate?.[0]) {
      payload.criminalRecordCertificate = await uploadFile(
        req.files.criminalRecordCertificate[0].path
      );
    }
  } catch (uploadError) {
    return res.status(500).json({
      status: false,
      msg: "Error uploading files",
    });
  }
  // Validate updated data
  const result = maidSchema(payload);
  if (result.error) {
    const errors = result.error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: false,
      msg: errors,
    });
  }

  try {
    // Update maid profile
    await Maid.updateOne({ _id }, { $set: payload });

    return res.status(200).json({
      status: true,
      msg: "Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};


/**
 *  @description get user info
 *  @route GET /api/user/user-info
 *  @access Private
 */
module.exports.getUserInfo = async (req, res) => {
  const { _id } = req.maid;

  try {
    const user = await Maid.findById(_id);
    if (!user) {
      return res.status(400).json({
        status: false,
        msg: "User not found",
      });
    }
    return res.status(200).json({
      status: true,
      userInfo: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};

/**
 *  @description get all maids
 *  @route PUT /api/user/delete-user
 *  @access Private
 */
module.exports.getAllMaids = async(req ,res)=>{
     try {
       const maids = await Maid.find();
        if (!maids) {
          return res.status(400).json({
            status: false,
            msg: "No maids found",
          });
        }
        return res.status(200).json({
          status: true,
          maids,
        });
     } catch (error) {
       return res.status(500).json({
        status: false,
        msg: error.message,
       })
     }
}

/**
 *  @description get specific maid
 *  @route PUT /api/user/specific-maid/:maidId
 *  @access Private
 */
module.exports.getSpecificMaids = async(req ,res)=>{
  const {maidId} = req.params;
  try {
    const maid = await Maid.findOne({ _id: maidId });

     return res.status(200).json({
       status: true,
       maid
     });
  } catch (error) {
    return res.status(500).json({
     status: false,
     msg: error.message,
    })
  }
}

/**
 *  @description delete user
 *  @route PUT /api/user/delete-user
 *  @access Private
 */
module.exports.deleteUser = async (req, res) => {
  const { _id } = req.maid;
  try {
    const user = await Maid.findByIdAndDelete(_id);
    if (!user) {
      return res.status(400).json({
        status: false,
        msg: "User not found",
      });
    }
    return res.status(200).json({
      status: true,
      msg: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: error.message,
    });
  }
};
