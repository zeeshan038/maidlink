//NPM Packages
const router = require("express").Router();

//Controllers
const { sendotp, verifyotp, register, login, forgotPassword, resetPassword, changePassword, editProfile, getUserInfo, deleteUser, getAllMaids, getAllOwners, getSpecificOwner } = require("../controllers/owner");
//middlwares
const verifyOwner = require("../middlewares/verifyOwner");
const upload = require("../utils/multer");

//Routes
router.post("/send-otp", sendotp);
router.post("/verify-otp" , verifyotp);
router.post("/register" , register);
router.post("/login",login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:phone" , resetPassword)
router.get('/all-owners', getAllOwners);
router.get('/specific-owner/:ownerId' ,getSpecificOwner )

//middleware
router.use(verifyOwner);

router.put("/change-password", changePassword);
router.put("/edit-profile", 
      upload.fields([
        { name: "profileImg", maxCount: 1 },
      
      ]),
      editProfile);
router.get('/get-user' , getUserInfo);
router.delete("/delete-acc" , deleteUser);

module.exports = router;
