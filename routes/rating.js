//NPM Packages
const express = require("express");
const { createRating, getMaidRatings } = require("../controllers/rating");
const router = express.Router();

//Controllers


router.post("/create", createRating);
router.get("/maid-ratings/:id", getMaidRatings);


module.exports = router;
