//NPM Packages
const bcrypt = require("bcrypt");

// utils
const sendOTP = require("../utils/otpcode");

//models
const OTP = require("../models/otp");

//Schema
const {
  registerSchema,
  loginSchema,
  passwordSchema,
  ownerSchema,
} = require("../schema/Owner");

//Models
const genrateToken = require("../utils/genrateToken");
const owner = require("../models/owner");
 
/**
 * @desciption Verify user phone no
 * @route POST /api/user/send-otp
 * @access Public
 */
module.exports.sendotp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ msg: "Phone number is required" });
  }

  try {
    const response = await sendOTP(phone);

    if (response.success) {
      // Store OTP in the database
      await OTP.create({ phone, otp: response.otp });

      return res.status(200).json({
        status: true,
        otp: response.otp,
        msg: "OTP sent successfully",
      });
    } else {
      return res.status(500).json({ message: response.message });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * @desciption  verify otp
 * @route POST /api/user/verify-otp
 * @access Public
 */
module.exports.verifyotp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ msg: "Phone and OTP are required" });
  }

  try {
    const validOTP = await OTP.findOne({ phone, otp });
    if (!validOTP) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }
    // otp got deleted once verfied
    await OTP.deleteOne({ phone });
    return res
      .status(200)
      .json({ status: true, msg: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

/**
 * @desciption regsiter home owner
 * @route POST /api/user/register
 * @access Public
 */
module.exports.register = async (req, res) => {
  const payload = req.body;

  //Error handling
  const result = registerSchema(payload);
  if (result.error) {
    const errors = result.error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: false,
      msg: errors,
    });
  }

  try {
    const existingUser = await owner.findOne({ userName: payload.userName });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        msg: "User with this email already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    //Creating user
    await owner.create({
      name: payload.name,
      userName: payload.userName,
      email: payload.email,
      phone: payload.phone,
      password: hashedPassword,
      profileImg: payload.profileImg,
      role: payload.role,
      fcm: payload.fcm,
      homeAddress: payload.homeAddress,
    });

    //Response
    return res.status(201).json({
      status: true,
      msg: "User Registered Successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      msg: error.message,
    });
  }
};

/**
 * @desciption login owner
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
    const validUser = await owner
      .findOne({ userName: payload.userName })
      .select("password");
    if (!validUser) {
      return res.status(401).json({
        status: false,
        msg: "userName  or Password is incorrect",
      });
    }

    const user = await owner.findOne({ userName: payload.userName });

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
        role: user.role,
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

  try {
    // Check if the user exists
    const user = await owner.findOne({ phone });
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
      await OTP.create({ phone, otp: response.otp });

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
    const user = await owner.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        status: false,
        msg: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await owner.updateOne(
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
 * @description Change password
 *  @route PUT /api/user/change-password
 *  @access Private
 */
module.exports.changePassword = async (req, res) => {
  const { _id } = req.user;
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
    const user = await owner.findById(_id).select("+password");

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
    await owner.updateOne({ _id }, { password: hashedPassword });

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
  const { _id } = req.user;
  console.log("user", _id);
  let payload = req.body;

  // Upload new images if provided
  try {
    if (req.files?.profileImg?.[0]) {
      payload.profileImg = await uploadFile(req.files.profileImg[0].path);
    }
  } catch (uploadError) {
    return res.status(500).json({
      status: false,
      msg: "Error uploading files",
    });
  }
  // Validate updated data
  const result = ownerSchema(payload);
  if (result.error) {
    const errors = result.error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: false,
      msg: errors,
    });
  }

  try {
    // Update maid profile
    await owner.updateOne({ _id }, { $set: payload });

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
  const { _id } = req.user;

  try {
    const user = await owner.findById(_id);
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
 *  @description delete user
 *  @route PUT /api/user/delete-user
 *  @access Private
 */
module.exports.deleteUser = async (req, res) => {
  const { _id } = req.user;
  try {
    const user = await owner.findByIdAndDelete(_id);
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

/**
 *  @description get all owners
 *  @route PUT /api/user/alll-owners
 *  @access Private
 */
module.exports.getAllOwners = async(req ,res)=>{
     try {
       const owners = await owner.find();
        if (!owners) {
          return res.status(400).json({
            status: false,
            msg: "No maids found",
          });
        }
        return res.status(200).json({
          status: true,
          owners,
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
 *  @route PUT /api/user/specific-owner/:ownerId
 *  @access Private
 */
module.exports.getSpecificOwner = async(req ,res)=>{
  const {ownerId} = req.params;
  try {
    const owners = await  owner.findOne({ _id: ownerId });

     return res.status(200).json({
       status: true,
       owners
     });
  } catch (error) {
    return res.status(500).json({
     status: false,
     msg: error.message,
    })
  }
}
