//NPM Packages
const express = require("express");
const router = express.Router();

//Controllers
const { createOder, applyOrder, acceptOrder, declineOrder, getOwnerOrders, getMaidOrders, specificOwnerOrder, specificMaidOrder } = require("../controllers/order");

// middleware
const verifyMaid = require("../middlewares/verifyMaid");
const verifyOwner = require("../middlewares/verifyOwner");

router.post("/create-order/:id", createOder);

//Private routes
router.use(verifyMaid);

router.post("/apply/:orderId", applyOrder);
router.get("/get-maid-order", getMaidOrders);
router.get("/get-specific-maid", specificMaidOrder);

router.use(verifyOwner);

router.post("/accept-order/:orderId", acceptOrder);
router.post("/decline-order/:orderId" , declineOrder)
router.get("/get-owner-order", getOwnerOrders);
router.get("/get-specific-owner", specificOwnerOrder);


module.exports = router;
