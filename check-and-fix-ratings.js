// This script can be run in the browser console to check and fix rating display issues

// Function to check if products have rating fields
window.checkProductRatings = async function() {
  try {
    console.log('Checking product ratings...');
    
    // Get all products using the product service
    const { getAllProducts } = await import('./src/firebase/services/productService.js');
    const products = await getAllProducts();
    
    console.log(`Found ${products.length} products`);
    
    let issues = [];
    let productsWithoutRatings = 0;
    let productsWithRatings = 0;
    
    products.forEach(product => {
      const hasRating = product.averageRating !== undefined && product.reviewCount !== undefined;
      
      if (!hasRating) {
        productsWithoutRatings++;
        issues.push({
          id: product.id,
          name: product.name,
          issue: 'Missing rating fields',
          averageRating: product.averageRating,
          reviewCount: product.reviewCount
        });
      } else {
        productsWithRatings++;
        
        // Check for inconsistencies
        if (product.averageRating > 0 && product.reviewCount === 0) {
          issues.push({
            id: product.id,
            name: product.name,
            issue: 'Rating > 0 but no reviews',
            averageRating: product.averageRating,
            reviewCount: product.reviewCount
          });
        } else if (product.averageRating === 0 && product.reviewCount > 0) {
          issues.push({
            id: product.id,
            name: product.name,
            issue: 'Reviews exist but rating is 0',
            averageRating: product.averageRating,
            reviewCount: product.reviewCount
          });
        }
      }
    });
    
    console.log(`Products with ratings: ${productsWithRatings}`);
    console.log(`Products without ratings: ${productsWithoutRatings}`);
    console.log('Issues found:', issues);
    
    return {
      totalProducts: products.length,
      productsWithRatings,
      productsWithoutRatings,
      issues
    };
  } catch (error) {
    console.error('Error checking product ratings:', error);
    throw error;
  }
};

// Function to fix missing rating fields
window.fixMissingRatingFields = async function() {
  try {
    console.log('Fixing missing rating fields...');
    
    const { getAllProducts, updateProduct } = await import('./src/firebase/services/productService.js');
    const products = await getAllProducts();
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        const needsUpdate = product.averageRating === undefined || product.reviewCount === undefined;
        
        if (needsUpdate) {
          console.log(`Fixing rating fields for product: ${product.name} (${product.id})`);
          
          await updateProduct(product.id, {
            averageRating: product.averageRating || 0,
            reviewCount: product.reviewCount || 0
          });
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error fixing product ${product.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} products, ${errorCount} errors`);
    
    // Invalidate cache to force refresh
    const { invalidateProductCache } = await import('./src/firebase/services/productQueryService.js');
    invalidateProductCache('all');
    
    return { fixedCount, errorCount };
  } catch (error) {
    console.error('Error fixing missing rating fields:', error);
    throw error;
  }
};

// Function to run the full rating fix
window.runFullRatingFix = async function() {
  try {
    console.log('Running full rating fix...');
    
    // First, check the current state
    const checkResult = await window.checkProductRatings();
    console.log('Initial check result:', checkResult);
    
    // Fix missing fields
    const fixResult = await window.fixMissingRatingFields();
    console.log('Fix result:', fixResult);
    
    // Run the comprehensive rating fix
    const { fixAllProductRatings } = await import('./src/firebase/services/productRatingFixService.js');
    const ratingFixResult = await fixAllProductRatings();
    console.log('Rating fix result:', ratingFixResult);
    
    // Check again to verify
    const finalCheck = await window.checkProductRatings();
    console.log('Final check result:', finalCheck);
    
    return {
      initialCheck: checkResult,
      fieldFix: fixResult,
      ratingFix: ratingFixResult,
      finalCheck: finalCheck
    };
  } catch (error) {
    console.error('Error running full rating fix:', error);
    throw error;
  }
};

// Function to test the ProductRating component directly
window.testProductRatingComponent = async function(productId) {
  try {
    console.log(`Testing ProductRating component for product ${productId}...`);
    
    // Get the product
    const { getProductById } = await import('./src/firebase/services/productService.js');
    const product = await getProductById(productId);
    
    console.log('Product data:', product);
    
    // Get reviews for this product
    const { getReviewsByProductId } = await import('./src/firebase/services/reviewService.js');
    const reviews = await getReviewsByProductId(productId);
    
    console.log('Reviews for product:', reviews);
    
    // Calculate expected rating
    let expectedRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      expectedRating = totalRating / reviews.length;
    }
    
    console.log('Expected rating:', expectedRating.toFixed(1));
    console.log('Product rating fields:', {
      averageRating: product.averageRating,
      reviewCount: product.reviewCount
    });
    
    return {
      product,
      reviews,
      expectedRating,
      productRating: {
        averageRating: product.averageRating,
        reviewCount: product.reviewCount
      }
    };
  } catch (error) {
    console.error('Error testing ProductRating component:', error);
    throw error;
  }
};

console.log('Product rating check and fix functions loaded. Use:');
console.log('1. checkProductRatings() - Check for rating issues');
console.log('2. fixMissingRatingFields() - Fix missing rating fields');
console.log('3. runFullRatingFix() - Run complete rating fix process');
console.log('4. testProductRatingComponent(productId) - Test a specific product');