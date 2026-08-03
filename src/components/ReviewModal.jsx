import React, { useState, useEffect } from 'react';
import { Star, X, Send, Edit2, Trash2 } from 'lucide-react';
import { createReview, updateReview, deleteReview } from '../firebase/services/reviewService';

const ReviewModal = ({
  isOpen,
  onClose,
  product,
  user,
  existingReview = null,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(!existingReview);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText);
      setIsEditing(false);
    } else {
      setRating(0);
      setReviewText('');
      setIsEditing(true);
    }
  }, [existingReview, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      setError('Please write a review');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        rating,
        reviewText: reviewText.trim(),
        orderId: product.orderId || null
      };

      let result;
      if (existingReview) {
        result = await updateReview(existingReview.id, reviewData);
      } else {
        result = await createReview(reviewData);
      }

      setIsSubmitting(false);
      onReviewSubmitted && onReviewSubmitted(result);
      onClose();
    } catch (error) {
      setIsSubmitting(false);

      // Check if the error is related to product rating update but review was still created
      // In this case, we still consider it a success since the review was created
      if (error.message && (
        error.message.includes('Product rating update failed') ||
        error.message.includes('Error updating product rating stats')
      )) {
        // Review was created but rating update failed - still consider it a success
        onReviewSubmitted && onReviewSubmitted(result);
        onClose();
      } else {
        // Provide more specific error messages based on the error type
        let errorMessage = 'Failed to submit review. Please try again.';

        if (error.code === 'permission-denied') {
          errorMessage = 'You do not have permission to submit reviews. Please contact support.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Service is currently unavailable. Please try again later.';
        } else if (error.code === 'deadline-exceeded') {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        }

        setError(errorMessage);
        console.error('Error submitting review:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    if (window.confirm('Are you sure you want to delete this review?')) {
      setIsSubmitting(true);
      try {
        await deleteReview(existingReview.id);
        setIsSubmitting(false);
        onReviewSubmitted && onReviewSubmitted(null);
        onClose();
      } catch (error) {
        setIsSubmitting(false);
        setError('Failed to delete review. Please try again.');
        console.error('Error deleting review:', error);
      }
    }
  };

  const StarRating = ({ value, onChange, disabled = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={`transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
              }`}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHoveredStar(star)}
            onMouseLeave={() => !disabled && setHoveredStar(0)}
          >
            <Star
              size={24}
              className={`${star <= (hoveredStar || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300 dark:fill-gray-600 dark:text-gray-600'
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">
              {existingReview ? 'Your Review' : 'Write a Review'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-medium dark:text-white">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {existingReview ? `Reviewed on ${new Date(existingReview.createdAt?.toDate?.() || existingReview.createdAt).toLocaleDateString()}` : 'Share your experience'}
              </p>
            </div>
          </div>

          {/* Existing Review Display */}
          {existingReview && !isEditing && (
            <div className="mb-6">
              <div className="mb-3">
                <StarRating value={existingReview.rating} onChange={() => { }} disabled={true} />
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {existingReview.reviewText}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-brand-primary text-white rounded hover:opacity-90 transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Review Form */}
          {(!existingReview || isEditing) && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {existingReview ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {existingReview ? 'Update Review' : 'Submit Review'}
                    </>
                  )}
                </button>
                {isEditing && existingReview && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;