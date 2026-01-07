const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Add a review to a product
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login to add a review' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }

    // Check product exists and user hasn't reviewed in parallel
    const [product, existingReview] = await Promise.all([
      Product.findById(productId).select('_id').lean(),
      Review.findOne({ product: productId, user: userId }).select('_id').lean()
    ]);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product. You can edit your existing review.' });
    }

    // Create new review
    const review = new Review({
      product: productId,
      user: userId,
      rating: parseInt(rating),
      comment: comment.trim()
    });

    await review.save();
    
    // Return immediately without heavy populate - frontend will reload reviews
    res.status(201).json({ 
      success: true, 
      message: 'Review added successfully',
      reviewId: review._id
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Error adding review' });
  }
};

// Get reviews for a product - optimized
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Run all queries in parallel for speed
    const [reviews, totalReviews, ratingStats] = await Promise.all([
      Review.find({ product: productId })
        .populate({
          path: 'user',
          select: 'username profile',
          populate: {
            path: 'profile',
            select: 'personalInfo.firstName personalInfo.lastName'
          }
        })
        .populate({
          path: 'replies.user',
          select: 'username profile',
          populate: {
            path: 'profile',
            select: 'personalInfo.firstName personalInfo.lastName'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      
      Review.countDocuments({ product: productId }),
      
      Review.aggregate([
        { $match: { product: productObjectId } },
        { 
          $group: { 
            _id: null, 
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          } 
        }
      ])
    ]);

    const averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 0;

    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit)
      },
      averageRating: averageRating.toFixed(1),
      totalReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

// Add a reply to a review
exports.addReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { text } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login to reply' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    // Use findByIdAndUpdate for faster atomic operation
    const result = await Review.findByIdAndUpdate(
      reviewId,
      {
        $push: {
          replies: {
            user: userId,
            text: text.trim(),
            createdAt: new Date(),
            likes: [],
            dislikes: []
          }
        }
      },
      { new: true, select: 'replies' }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Reply added successfully'
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, message: 'Error adding reply' });
  }
};

// Like a review - optimized with atomic operations
exports.likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login to like' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if user already liked
    const review = await Review.findById(reviewId).select('likes dislikes').lean();
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const alreadyLiked = review.likes.some(id => id.toString() === userId);

    // Use atomic update for speed
    const updateOp = alreadyLiked 
      ? { $pull: { likes: userObjectId } }
      : { $addToSet: { likes: userObjectId }, $pull: { dislikes: userObjectId } };

    const updatedReview = await Review.findByIdAndUpdate(reviewId, updateOp, { new: true, select: 'likes dislikes' }).lean();

    res.json({ 
      success: true, 
      likesCount: updatedReview.likes.length,
      dislikesCount: updatedReview.dislikes.length,
      userLiked: !alreadyLiked,
      userDisliked: false
    });
  } catch (error) {
    console.error('Error liking review:', error);
    res.status(500).json({ success: false, message: 'Error liking review' });
  }
};

// Dislike a review - optimized
exports.dislikeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login to dislike' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if user already disliked
    const review = await Review.findById(reviewId).select('likes dislikes').lean();
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const alreadyDisliked = review.dislikes.some(id => id.toString() === userId);

    // Use atomic update for speed
    const updateOp = alreadyDisliked 
      ? { $pull: { dislikes: userObjectId } }
      : { $addToSet: { dislikes: userObjectId }, $pull: { likes: userObjectId } };

    const updatedReview = await Review.findByIdAndUpdate(reviewId, updateOp, { new: true, select: 'likes dislikes' }).lean();

    res.json({ 
      success: true, 
      likesCount: updatedReview.likes.length,
      dislikesCount: updatedReview.dislikes.length,
      userLiked: false,
      userDisliked: !alreadyDisliked
    });
  } catch (error) {
    console.error('Error disliking review:', error);
    res.status(500).json({ success: false, message: 'Error disliking review' });
  }
};

// Like a reply
exports.likeReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login to like' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const reply = review.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Remove from dislikes if exists
    reply.dislikes = reply.dislikes.filter(id => id.toString() !== userId);

    // Toggle like
    const likeIndex = reply.likes.findIndex(id => id.toString() === userId);
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(userId);
    }

    await review.save();

    res.json({ 
      success: true, 
      likesCount: reply.likes.length,
      dislikesCount: reply.dislikes.length,
      userLiked: likeIndex === -1,
      userDisliked: false
    });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ success: false, message: 'Error liking reply' });
  }
};

// Dislike a reply
exports.dislikeReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login to dislike' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const reply = review.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Remove from likes if exists
    reply.likes = reply.likes.filter(id => id.toString() !== userId);

    // Toggle dislike
    const dislikeIndex = reply.dislikes.findIndex(id => id.toString() === userId);
    if (dislikeIndex > -1) {
      reply.dislikes.splice(dislikeIndex, 1);
    } else {
      reply.dislikes.push(userId);
    }

    await review.save();

    res.json({ 
      success: true, 
      likesCount: reply.likes.length,
      dislikesCount: reply.dislikes.length,
      userLiked: false,
      userDisliked: dislikeIndex === -1
    });
  } catch (error) {
    console.error('Error disliking reply:', error);
    res.status(500).json({ success: false, message: 'Error disliking reply' });
  }
};

// Delete a review (only by the review author)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if the user is the author of the review
    if (review.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Error deleting review' });
  }
};

// Update a review (only by the review author)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please login' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if the user is the author of the review
    if (review.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews' });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      }
      review.rating = parseInt(rating);
    }

    if (comment) {
      if (comment.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
      }
      review.comment = comment.trim();
    }

    await review.save();
    await review.populate('user', 'firstName lastName');

    res.json({ 
      success: true, 
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Error updating review' });
  }
};
