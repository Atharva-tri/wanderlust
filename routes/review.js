const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// ========================
// CREATE REVIEW
// ========================
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// ========================
// DELETE REVIEW & REDIRECT FIX
// ========================
router
  .route("/:reviewId")
  .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))
  .get((req, res) => {
    // If a user is redirected here after login (via GET), send them back to the listing
    const { id } = req.params;
    res.redirect(`/listings/${id}`);
  });

module.exports = router;
