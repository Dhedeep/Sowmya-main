import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, AlertCircle } from 'lucide-react';
import { getReviewsByProductId } from '../firebase/services/reviewService';

const ProductRatingEnhanced = ({ productId, averageRating, reviewCount, showReviews = false, debug = false }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [error, setError] = useState(null);

  const loadReviews = async () => {
    if (!productId) {
      debug && console.error('ProductRating: No productId provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      debug && console.log(`ProductRating: Loading reviews for product ${productId}...`);
      const reviewsData = await getReviewsByProductId(productId);
      debug && console.log(`ProductRating: Found ${reviewsData.length} reviews`, reviewsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('ProductRating: Error loading reviews:', error);
      setError(error.message || 'Failed to load reviews');
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

  // Debug information
  if (debug) {
    console.log('ProductRating Debug Info:', {
      productId,
      averageRating,
      reviewCount,
      showReviews,
      reviewsCount: reviews.length,
      loading,
      error
    });
  }

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

      {/* Debug Information */}
      {debug && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 text-xs">
          <div className="flex items-center gap-1 mb-1">
            <AlertCircle size={12} className="text-yellow-600" />
            <span className="font-medium text-yellow-800 dark:text-yellow-300">Debug Info:</span>
          </div>
          <div className="space-y-1 text-yellow-700 dark:text-yellow-400">
            <div>Product ID: {productId}</div>
            <div>Average Rating: {averageRating}</div>
            <div>Review Count: {reviewCount}</div>
            <div>Show Reviews: {showReviews ? 'Yes' : 'No'}</div>
            <div>Loaded Reviews: {reviews.length}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            {error && <div className="text-red-600">Error: {error}</div>}
          </div>
        </div>
      )}

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
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                <AlertCircle size={16} />
                <span className="font-medium">Error loading reviews</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              <button
                onClick={loadReviews}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Try again
              </button>
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

export default ProductRatingEnhanced;