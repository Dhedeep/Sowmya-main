// This script can be used to test routing after deployment
// Run this in the browser console on your deployed site

const testRoutes = [
  '/',
  '/shop',
  '/shop?category=unstitched-suits',
  '/product/test-id',
  '/about',
  '/contact',
  '/checkout',
  '/dashboard',
  '/admin',
  '/orders',
  '/downloads',
  '/addresses',
  '/account-details',
  '/wishlist',
  '/returns-policy',
  '/terms-conditions',
  '/privacy-policy',
  '/login',
  '/register'
];

console.log('Testing application routes...');
console.log('Current URL:', window.location.href);

// Test if React Router is properly initialized
if (window.ReactRouter) {
  console.log('✅ React Router detected');
} else {
  console.log('❌ React Router not detected');
}

// Check if the base href is set correctly
const baseElement = document.querySelector('base');
if (baseElement && baseElement.getAttribute('href') === '/') {
  console.log('✅ Base href is correctly set to "/"');
} else {
  console.log('❌ Base href is not correctly set');
}

// Test if the root element exists
if (document.getElementById('root')) {
  console.log('✅ Root element found');
} else {
  console.log('❌ Root element not found');
}

console.log('To test direct navigation to routes:');
console.log('1. Open a new tab');
console.log('2. Navigate directly to one of these routes:');
testRoutes.forEach(route => console.log(`   ${window.location.origin}${route}`));
console.log('3. Each should load the application and display the correct page');