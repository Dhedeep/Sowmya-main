// Copy and paste this entire script into your browser console while on the product detail page
// Make sure you're logged into the application first

(async function() {
  console.log('🔍 Starting review check for product /XsGBWZJexGVCgA457ozA...');
  
  try {
    // Import required services
    const { getProductById } = await import('./src/firebase/services/productService.js');
    const { getReviewsByProductId } = await import('./src/firebase/services/reviewService.js');
    const { fixProductRating } = await import('./src/firebase/services/productRatingFixService.js');
    
    const productId = '/XsGBWZJexGVCgA457ozA';
    
    // Step 1: Get product data
    console.log('📦 Fetching product data...');
    const product = await getProductById(productId);
    console.log('Product:', product.name);
    console.log('Product ID:', product.id);
    console.log('Current averageRating:', product.averageRating);
    console.log('Current reviewCount:', product.reviewCount);
    
    // Step 2: Get all reviews for this product
    console.log('\n📝 Fetching reviews...');
    const reviews = await getReviewsByProductId(productId);
    console.log(`Found ${reviews.length} reviews`);
    
    if (reviews.length > 0) {
      console.log('Reviews:');
      reviews.forEach((review, index) => {
        console.log(`  ${index + 1}. Rating: ${review.rating}, User: ${review.userName || 'Anonymous'}`);
        console.log(`     Text: ${review.reviewText.substring(0, 50)}...`);
        console.log(`     Created: ${review.createdAt?.toDate?.() || review.createdAt}`);
      });
      
      // Calculate expected rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const expectedRating = totalRating / reviews.length;
      console.log('\n📊 Calculated rating:');
      console.log(`Expected averageRating: ${expectedRating.toFixed(1)}`);
      console.log(`Expected reviewCount: ${reviews.length}`);
      
      // Check for inconsistencies
      const ratingMismatch = Math.abs((product.averageRating || 0) - expectedRating) > 0.01;
      const countMismatch = (product.reviewCount || 0) !== reviews.length;
      
      if (ratingMismatch || countMismatch) {
        console.warn('\n⚠️ Rating inconsistency detected!');
        console.log('Stored vs Expected:');
        console.log(`  averageRating: ${product.averageRating || 0} vs ${expectedRating.toFixed(1)}`);
        console.log(`  reviewCount: ${product.reviewCount || 0} vs ${reviews.length}`);
        
        // Offer to fix
        if (confirm('Rating inconsistency detected. Would you like to fix it?')) {
          console.log('\n🔧 Fixing rating...');
          await fixProductRating(productId);
          console.log('✅ Rating fixed! Please refresh the page to see updated ratings.');
        }
      } else {
        console.log('\n✅ Rating data is consistent');
      }
    } else {
      console.log('\n❌ No reviews found for this product');
    }
    
    // Step 3: Check if ProductRating component is properly rendered
    console.log('\n🎨 Checking UI components...');
    
    // Check if ProductRating component is in the DOM
    const ratingElements = document.querySelectorAll('[class*="rating"], [class*="Rating"]');
    console.log(`Found ${ratingElements.length} rating-related elements in the DOM`);
    
    // Look for the specific ProductRating component
    const productRatingElement = Array.from(ratingElements).find(el => 
      el.textContent.includes('review') || el.textContent.includes('Rating')
    );
    
    if (productRatingElement) {
      console.log('✅ ProductRating component found in DOM');
      console.log('Element:', productRatingElement);
    } else {
      console.error('❌ ProductRating component not found in DOM');
      console.log('This might indicate a rendering issue with the component.');
    }
    
    // Step 4: Check if reviews are being displayed
    const reviewElements = document.querySelectorAll('[class*="review"], [class*="Review"]');
    console.log(`Found ${reviewElements.length} review-related elements in the DOM`);
    
    if (reviewElements.length > 0) {
      console.log('Review elements found:');
      reviewElements.forEach((el, index) => {
        console.log(`  ${index + 1}.`, el);
      });
    } else {
      console.warn('No review elements found in the DOM');
    }
    
    console.log('\n🏁 Review check completed!');
    
  } catch (error) {
    console.error('❌ Error during review check:', error);
  }
})();