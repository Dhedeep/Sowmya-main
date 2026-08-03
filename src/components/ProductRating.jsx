import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User } from 'lucide-react';
import { getReviewsByProductId } from '../firebase/services/reviewService';

const ProductRating = ({ productId, averageRating, reviewCount, showReviews = false }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const loadReviews = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const reviewsData = await getReviewsByProductId(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showReviews && productId) {
      loadReviews();
    }
  }, [productId, showReviews]);

  const StarRating = ({ rating, size = 'small' }) => {
    const starSize = size === 'small' ? 14 : size === 'medium' ? 16 : 20;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSize}
            className={`${star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-300 dark:fill-gray-600 dark:text-gray-600'
              }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString();
    } else if (date) {
      return new Date(date).toLocaleDateString();
    }
    return 'Unknown date';
  };

  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="flex items-center gap-3">
        <StarRating rating={Math.round(averageRating || 0)} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {averageRating !== undefined && averageRating > 0 ? averageRating.toFixed(1) : 'No rating'}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({reviewCount || 0} {(reviewCount || 0) === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {/* Reviews Section */}
      {showReviews && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <MessageSquare size={16} />
            Customer Reviews
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {displayReviews.map((review) => (
                <div key={review.id} className="border-b dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm dark:text-white">
                          {review.userName || 'Anonymous'}
                        </span>
                        <StarRating rating={review.rating} size="small" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {formatDate(review.createdAt)}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {review.reviewText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="text-brand-primary hover:underline text-sm font-medium"
                >
                  {showAllReviews ? 'Show less' : `Show all ${reviews.length} reviews`}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductRating;