import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  average,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

const REVIEWS_COLLECTION = 'reviews';

// Create a new review
export const createReview = async (reviewData) => {
  try {
    if (!reviewData) {
      throw new Error('Review data is required');
    }

    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const newReview = {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(reviewsRef, newReview);
    const createdReview = { id: docRef.id, ...newReview };

    // Update product rating statistics - don't let this failure break the review creation
    try {
      await updateProductRatingStats(reviewData.productId);
    } catch (ratingError) {
      console.error('Error updating product rating stats (review was still created):', ratingError);
      // We don't throw here because the review was successfully created
      // The rating can be updated later through a batch process or manual fix
    }

    console.log('Review created with ID:', createdReview.id);
    return createdReview;
  } catch (error) {
    console.error('Error in createReview:', error);
    throw error;
  }
};

// Get all reviews for a product
export const getReviewsByProductId = async (productId) => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    return reviews;
  } catch (error) {
    console.error('Error getting reviews by product ID:', error);
    throw error;
  }
};

// Get reviews by user ID
export const getReviewsByUserId = async (userId) => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    return reviews;
  } catch (error) {
    console.error('Error getting reviews by user ID:', error);
    throw error;
  }
};

// Get review by ID
export const getReviewById = async (reviewId) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewDoc = await getDoc(reviewRef);

    if (reviewDoc.exists()) {
      return { id: reviewDoc.id, ...reviewDoc.data() };
    } else {
      throw new Error('Review not found');
    }
  } catch (error) {
    console.error('Error getting review by ID:', error);
    throw error;
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }

    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const updateData = {
      ...reviewData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(reviewRef, updateData);

    // Get the updated review to update product stats
    const updatedReview = await getReviewById(reviewId);
    
    // Update product rating statistics - don't let this failure break the review update
    try {
      await updateProductRatingStats(updatedReview.productId);
    } catch (ratingError) {
      console.error('Error updating product rating stats (review was still updated):', ratingError);
      // We don't throw here because the review was successfully updated
      // The rating can be updated later through a batch process or manual fix
    }

    return updatedReview;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    if (!reviewId) {
      throw new Error('Review ID is required');
    }

    // Get the review before deleting to update product stats
    const review = await getReviewById(reviewId);
    const productId = review.productId;

    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(reviewRef);

    // Update product rating statistics
    await updateProductRatingStats(productId);

    console.log('Review deleted with ID:', reviewId);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Check if user has already reviewed a product
export const hasUserReviewedProduct = async (userId, productId) => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      where('productId', '==', productId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if user reviewed product:', error);
    throw error;
  }
};

// Get user's review for a specific product
export const getUserReviewForProduct = async (userId, productId) => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      where('productId', '==', productId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const reviewDoc = querySnapshot.docs[0];
    return { id: reviewDoc.id, ...reviewDoc.data() };
  } catch (error) {
    console.error('Error getting user review for product:', error);
    throw error;
  }
};

// Calculate and update product rating statistics
export const updateProductRatingStats = async (productId) => {
  try {
    const reviews = await getReviewsByProductId(productId);
    
    if (reviews.length === 0) {
      // If no reviews, set rating to 0
      await updateProductRating(productId, 0, 0);
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const reviewCount = reviews.length;

    await updateProductRating(productId, averageRating, reviewCount);
  } catch (error) {
    console.error('Error updating product rating stats:', error);
    throw error;
  }
};

// Update product with rating information
export const updateProductRating = async (productId, averageRating, reviewCount) => {
  try {
    const { updateProduct } = await import('./productService');
    await updateProduct(productId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviewCount
    });
    console.log(`Successfully updated rating for product ${productId}: ${averageRating.toFixed(1)} (${reviewCount} reviews)`);
  } catch (error) {
    console.error('Error updating product rating:', error);
    // Add more context to the error
    const enhancedError = new Error(`Failed to update product rating for ${productId}: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.code = error.code || 'product-rating-update-failed';
    throw enhancedError;
  }
};

// Get reviews for an order (for review management in orders)
export const getReviewsForOrderItems = async (orderItems, userId) => {
  try {
    const reviews = [];
    
    for (const item of orderItems) {
      const userReview = await getUserReviewForProduct(userId, item.id);
      reviews.push({
        productId: item.id,
        productName: item.name,
        productImage: item.images?.[0] || item.image,
        userReview: userReview,
        hasReviewed: !!userReview
      });
    }

    return reviews;
  } catch (error) {
    console.error('Error getting reviews for order items:', error);
    throw error;
  }
};

// Get recent reviews (for admin dashboard)
export const getRecentReviews = async (limitCount = 10) => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
      reviewsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    return reviews;
  } catch (error) {
    console.error('Error getting recent reviews:', error);
    throw error;
  }
};