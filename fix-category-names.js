// Script to update existing products with category and subcategory names
// Run this once to fix existing products that don't have categoryName/subcategoryName fields

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixProductCategories() {
  try {
    console.log('Starting to fix product categories...');
    
    // Get all products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    // Get all categories for name lookup
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    // Create category lookup map
    const categoryMap = {};
    categoriesSnapshot.forEach(doc => {
      const categoryData = { id: doc.id, ...doc.data() };
      categoryMap[categoryData.id] = categoryData.name;
    });
    
    let updatedCount = 0;
    
    // Update each product if needed
    for (const productDoc of productsSnapshot.docs) {
      const product = { id: productDoc.id, ...productDoc.data() };
      
      const updates = {};
      let needsUpdate = false;
      
      // Add category name if missing
      if (product.category && !product.categoryName && categoryMap[product.category]) {
        updates.categoryName = categoryMap[product.category];
        needsUpdate = true;
      }
      
      // Add subcategory name if missing
      if (product.subcategory && !product.subcategoryName && categoryMap[product.subcategory]) {
        updates.subcategoryName = categoryMap[product.subcategory];
        needsUpdate = true;
      }
      
      // Update product if needed
      if (needsUpdate) {
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, updates);
        updatedCount++;
        console.log(`Updated product: ${product.name} (${product.id})`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} products with category names`);
    console.log('Product category fix completed!');
    
  } catch (error) {
    console.error('Error fixing product categories:', error);
  }
}

// Run the fix
fixProductCategories().then(() => {
  console.log('Script completed. You can now exit.');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});