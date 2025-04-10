const router = require("express").Router();

//paths
const owner = require("./owner");
const maid = require("./maid");
const order = require("./order");
const rating = require("./rating");

// routes
router.use("/user", owner);
router.use("/maid", maid);
router.use("/order", order);
router.use("/rating", rating);

module.exports = router;
