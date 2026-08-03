// Script to debug reviews for a specific product
// Run this in the browser console to check if reviews exist for product /XsGBWZJexGVCgA457ozA

window.debugProductReviews = async function(productId = '/XsGBWZJexGVCgA457ozA') {
  try {
    console.log(`Debugging reviews for product: ${productId}`);
    
    // Import required services
    const { getProductById } = await import('./src/firebase/services/productService.js');
    const { getReviewsByProductId } = await import('./src/firebase/services/reviewService.js');
    
    // Get product data
    console.log('1. Fetching product data...');
    const product = await getProductById(productId);
    console.log('Product data:', product);
    
    // Check if product has rating fields
    console.log('2. Checking product rating fields...');
    console.log('Product averageRating:', product.averageRating);
    console.log('Product reviewCount:', product.reviewCount);
    
    // Get all reviews for this product
    console.log('3. Fetching reviews...');
    const reviews = await getReviewsByProductId(productId);
    console.log('Reviews found:', reviews.length);
    console.log('Review data:', reviews);
    
    // Calculate expected rating
    console.log('4. Calculating expected rating...');
    let expectedRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      expectedRating = totalRating / reviews.length;
    }
    console.log('Expected average rating:', expectedRating.toFixed(1));
    console.log('Expected review count:', reviews.length);
    
    // Check for inconsistencies
    console.log('5. Checking for inconsistencies...');
    const hasRatingInconsistency = 
      Math.abs((product.averageRating || 0) - expectedRating) > 0.01 ||
      (product.reviewCount || 0) !== reviews.length;
    
    if (hasRatingInconsistency) {
      console.warn('Rating inconsistency detected!');
      console.log({
        productId,
        productName: product.name,
        storedRating: product.averageRating || 0,
        expectedRating,
        storedCount: product.reviewCount || 0,
        expectedCount: reviews.length
      });
    } else {
      console.log('No rating inconsistencies detected.');
    }
    
    // Check if reviews are being displayed in the UI
    console.log('6. Checking UI display...');
    const productRatingElement = document.querySelector('[data-testid="product-rating"]');
    if (productRatingElement) {
      console.log('Product rating element found:', productRatingElement);
    } else {
      console.log('Product rating element not found in DOM');
    }
    
    // Check if ProductRating component is being rendered
    const ratingComponents = document.querySelectorAll('.product-rating, [class*="rating"]');
    console.log('Rating components found:', ratingComponents.length);
    
    return {
      product,
      reviews,
      expectedRating,
      hasRatingInconsistency,
      reviewCount: reviews.length
    };
  } catch (error) {
    console.error('Error debugging product reviews:', error);
    throw error;
  }
};

// Function to fix rating for a specific product
window.fixProductRating = async function(productId = '/XsGBWZJexGVCgA457ozA') {
  try {
    console.log(`Fixing rating for product: ${productId}`);
    
    const { fixProductRating } = await import('./src/firebase/services/productRatingFixService.js');
    const result = await fixProductRating(productId);
    
    console.log('Rating fix result:', result);
    
    // Re-check after fix
    console.log('Re-checking after fix...');
    const debugResult = await window.debugProductReviews(productId);
    
    return {
      fixResult: result,
      debugAfterFix: debugResult
    };
  } catch (error) {
    console.error('Error fixing product rating:', error);
    throw error;
  }
};

console.log('Review debugging functions loaded. Use:');
console.log('1. debugProductReviews() - Debug reviews for product /XsGBWZJexGVCgA457ozA');
console.log('2. debugProductReviews(productId) - Debug reviews for a specific product');
console.log('3. fixProductRating() - Fix rating for product /XsGBWZJexGVCgA457ozA');
console.log('4. fixProductRating(productId) - Fix rating for a specific product');