const ratingModel = require("../models/ratings");



/**
 *  @description create rating
 *  @route POST /api/rating/create
 *  @access Private
 */
module.exports.createRating = async (req, res) => {
  const allowedTypes = ["owner", "maid"];
  const { user, userType, reciever, recieverType, rating, comment } = req.body;

  if (rating <= 0) {
    return res.status(400).json({ status: false, msg: "Please provide a valid rating (greater than 0)" });
  }

  if (!allowedTypes.includes(userType)) {
    return res.status(400).json({ status: false, msg: "Invalid User Type" });
  }

  if (!allowedTypes.includes(recieverType)) {
    return res.status(400).json({ status: false, msg: "Invalid Reciever Type" });
  }

  try {

    const review = {
      rating,
      comment,
      user, 
      userType
    };

    let ratingDoc = await ratingModel.findOne({ user: reciever, userType: recieverType });

    if (!ratingDoc) {
      ratingDoc = new ratingModel({
        user: reciever,
        userType: recieverType,
        reviews: [review],
        rating,
        numReviews: 1,
      });

      await ratingDoc.save();

      return res.status(200).json({ status: true, msg: "Rating added successfully" });
    }


    ratingDoc.reviews.push(review);
    ratingDoc.numReviews = ratingDoc.reviews.length;

    // Recalculate the average rating
    ratingDoc.rating =
      ratingDoc.reviews.reduce((acc, item) => item.rating + acc, 0) /
      ratingDoc.reviews.length;

    // Save the updated rating document
    await ratingDoc.save();

    return res.status(200).json({ status: true, msg: "Rating added successfully" });
  } catch (error) {
    console.error("Rating error:", error);
    return res.status(500).json({ errors: "Something went wrong. Please try again." });
  }
};



/**
 *  @description get maid ratings
 *  @route POST /api/rating/maid-ratings
 *  @access Private
 */
module.exports.getMaidRatings = async (req, res) => {
    const {id} = req.params;

    try {
        const ratings = await ratingModel.findOne({ user: id, userType: "owner" }); 
        console.log(ratings)
        if (!ratings) {
          return res.status(200).json({
            status: true,
            msg: "No ratings for this driver",
          });
        }
    
        return res.status(200).json({
          status: true,
          ratings,
        });
      } catch (error) {
        return res.status(500).json({
          status: false,
          error: error.message,
        });
      }
    
}