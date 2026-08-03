import { getProductsByFilters } from './productQueryService';
import { getReviewsByProductId, updateProductRating } from './reviewService';

/**
 * Recalculates and fixes rating statistics for all products
 * This can be run periodically or when rating inconsistencies are detected
 */
export const fixAllProductRatings = async () => {
  try {
    console.log('Starting to fix all product ratings...');
    
    // Get all products
    const products = await getProductsByFilters({});
    console.log(`Found ${products.length} products to check`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        // Get all reviews for this product
        const reviews = await getReviewsByProductId(product.id);
        
        // Calculate new rating statistics
        let newAverageRating = 0;
        let newReviewCount = reviews.length;
        
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          newAverageRating = totalRating / reviews.length;
        }
        
        // Check if ratings need updating
        const needsUpdate = 
          Math.abs((product.averageRating || 0) - newAverageRating) > 0.01 ||
          (product.reviewCount || 0) !== newReviewCount;
        
        if (needsUpdate) {
          console.log(`Updating ratings for product ${product.id} (${product.name}):`, {
            oldRating: product.averageRating || 0,
            newRating: newAverageRating.toFixed(1),
            oldCount: product.reviewCount || 0,
            newCount: newReviewCount
          });
          
          await updateProductRating(product.id, newAverageRating, newReviewCount);
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error fixing ratings for product ${product.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Product rating fix completed: ${fixedCount} products updated, ${errorCount} errors`);
    return { fixedCount, errorCount, totalProducts: products.length };
  } catch (error) {
    console.error('Error in fixAllProductRatings:', error);
    throw error;
  }
};

/**
 * Recalculates and fixes rating statistics for a specific product
 */
export const fixProductRating = async (productId) => {
  try {
    console.log(`Fixing rating for product ${productId}...`);
    
    // Get all reviews for this product
    const reviews = await getReviewsByProductId(productId);
    
    // Calculate new rating statistics
    let newAverageRating = 0;
    let newReviewCount = reviews.length;
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      newAverageRating = totalRating / reviews.length;
    }
    
    // Update the product rating
    await updateProductRating(productId, newAverageRating, newReviewCount);
    
    console.log(`Updated ratings for product ${productId}:`, {
      averageRating: newAverageRating.toFixed(1),
      reviewCount: newReviewCount
    });
    
    return { averageRating: newAverageRating, reviewCount: newReviewCount };
  } catch (error) {
    console.error(`Error fixing rating for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Checks for products with rating inconsistencies
 */
export const checkProductRatingConsistency = async () => {
  try {
    console.log('Checking product rating consistency...');
    
    // Get all products
    const products = await getProductsByFilters({});
    const inconsistentProducts = [];
    
    for (const product of products) {
      try {
        // Get all reviews for this product
        const reviews = await getReviewsByProductId(product.id);
        
        // Calculate expected rating statistics
        let expectedAverageRating = 0;
        const expectedReviewCount = reviews.length;
        
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          expectedAverageRating = totalRating / reviews.length;
        }
        
        // Check if ratings are inconsistent
        const isInconsistent = 
          Math.abs((product.averageRating || 0) - expectedAverageRating) > 0.01 ||
          (product.reviewCount || 0) !== expectedReviewCount;
        
        if (isInconsistent) {
          inconsistentProducts.push({
            id: product.id,
            name: product.name,
            currentRating: product.averageRating || 0,
            expectedRating: expectedAverageRating,
            currentCount: product.reviewCount || 0,
            expectedCount: expectedReviewCount
          });
        }
      } catch (error) {
        console.error(`Error checking product ${product.id}:`, error);
      }
    }
    
    console.log(`Found ${inconsistentProducts.length} products with rating inconsistencies`);
    return inconsistentProducts;
  } catch (error) {
    console.error('Error in checkProductRatingConsistency:', error);
    throw error;
  }
};