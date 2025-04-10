const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

//Controllers
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  editProfile,
  getUserInfo,
  deleteUser,
  getAllMaids,
  getSpecificMaids,
} = require("../controllers/maid");

//Middleware
const verifyMaid = require("../middlewares/verifyMaid");
const { verifyotp } = require("../controllers/owner");

router.post(
  "/register",
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "cnic", maxCount: 1 },
    { name: "criminalRecordCertificate", maxCount: 1 },
  ]),
  register
);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyotp);
router.put("/reset-password/:phone", resetPassword);
router.get('/all-maids', getAllMaids);
router.get('/specific-maid/:maidId' ,getSpecificMaids )
//Private routes
router.use(verifyMaid);
router.put("/change-password", changePassword);
router.put(
  "/edit-profile",
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "cnic", maxCount: 1 },
    { name: "criminalRecordCertificate", maxCount: 1 },
  ]),
  editProfile
);
router.get("/get-user", getUserInfo);
router.delete("/delete-acc", deleteUser);

module.exports = router;
