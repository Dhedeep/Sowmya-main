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
  limit,
  where,
  runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import {
  getProductsByFilters,
  getProductById as getProductByIdOptimized,
  invalidateProductCache
} from './productQueryService';

const PRODUCTS_COLLECTION = 'products';

// Get all products (using optimized query service)
export const getAllProducts = async () => {
  try {
    return await getProductsByFilters({});
  } catch (error) {
    console.error('Error fetching products from Firebase:', error);
    // Check if it's a permission error
    if (error.code === 'permission-denied') {
      console.warn('Permission denied. Firebase rules may need to be updated for public read access.');
    }
    throw error;
  }
};

// Get product by ID (using optimized query service)
export const getProductById = async (productId) => {
  try {
    return await getProductByIdOptimized(productId);
  } catch (error) {
    throw error;
  }
};

// Get products by category (using optimized query service)
export const getProductsByCategory = async (category) => {
  try {
    return await getProductsByFilters({ category });
  } catch (error) {
    throw error;
  }
};

// Get products by subcategory (using optimized query service)
export const getProductsBySubcategory = async (subcategory) => {
  try {
    return await getProductsByFilters({ subcategory });
  } catch (error) {
    throw error;
  }
};

// Get products by category or subcategory (using optimized query service)
export const getProductsByCategoryOrSubcategory = async (categoryOrSubcategory) => {
  try {
    const { getProductsByCategoryOrSubcategory: optimizedFunction } = await import('./productQueryService');
    return await optimizedFunction(categoryOrSubcategory);
  } catch (error) {
    throw error;
  }
};

// Create new product
export const createProduct = async (productData, imageFiles) => {
  try {
    // Handle images - if they're already URLs (from constants), use them directly
    let imageUrls = [];

    if (imageFiles && imageFiles.length > 0) {
      // Upload new image files
      for (const file of imageFiles) {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls.push(downloadUrl);
      }
    } else if (productData.images && Array.isArray(productData.images)) {
      // Use existing image URLs (from constants)
      imageUrls = productData.images;
    }

    // Add product to Firestore
    const productsRef = collection(db, PRODUCTS_COLLECTION);

    // Get category name if category ID is provided
    let categoryName = '';
    let subcategoryName = '';

    if (productData.category) {
      try {
        const { getCategoryById } = await import('./categoryService');
        const category = await getCategoryById(productData.category);
        categoryName = category ? category.name : '';
      } catch (error) {
        console.error('Error fetching category name:', error);
      }
    }

    if (productData.subcategory) {
      if (productData.subcategory === 'new-arrivals') {
        subcategoryName = 'New Arrivals';
      } else {
        try {
          const { getCategoryById } = await import('./categoryService');
          const subcategory = await getCategoryById(productData.subcategory);
          subcategoryName = subcategory ? subcategory.name : '';
        } catch (error) {
          console.error('Error fetching subcategory name:', error);
        }
      }
    }

    // Initialize pre-order fields with default values if not provided
    const newProduct = {
      ...productData,
      categoryName,
      subcategoryName,
      images: imageUrls,
      isPreOrder: productData.isPreOrder || false,
      preOrderPrice: productData.preOrderPrice || null,
      preOrderStartDate: productData.preOrderStartDate || null,
      preOrderEndDate: productData.preOrderEndDate || null,
      expectedShippingDate: productData.expectedShippingDate || null,
      preOrderStock: productData.preOrderStock || 0,
      preOrderLimit: productData.preOrderLimit || null,
      preOrderMessage: productData.preOrderMessage || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(productsRef, newProduct);
    return { id: docRef.id, ...newProduct };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, productData, newImageFiles = null) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required for update');
    }

    console.log('Updating product with ID:', productId);
    console.log('Product data:', productData);

    const productRef = doc(db, PRODUCTS_COLLECTION, String(productId));

    // Handle image updates
    let updatedImages = productData.images || [];

    if (newImageFiles && newImageFiles.length > 0) {
      console.log('Uploading new images:', newImageFiles.length);
      // Upload new images
      const newImageUrls = [];
      for (const file of newImageFiles) {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        newImageUrls.push(downloadUrl);
        console.log('Uploaded new image:', downloadUrl);
      }

      // Combine existing images with new ones
      updatedImages = [...updatedImages, ...newImageUrls];
    }

    // Get category name if category ID is provided
    let categoryName = productData.categoryName || '';
    let subcategoryName = productData.subcategoryName || '';

    if (productData.category && !productData.categoryName) {
      try {
        const { getCategoryById } = await import('./categoryService');
        const category = await getCategoryById(productData.category);
        categoryName = category ? category.name : '';
      } catch (error) {
        console.error('Error fetching category name:', error);
      }
    }

    if (productData.subcategory && !productData.subcategoryName) {
      if (productData.subcategory === 'new-arrivals') {
        subcategoryName = 'New Arrivals';
      } else {
        try {
          const { getCategoryById } = await import('./categoryService');
          const subcategory = await getCategoryById(productData.subcategory);
          subcategoryName = subcategory ? subcategory.name : '';
        } catch (error) {
          console.error('Error fetching subcategory name:', error);
        }
      }
    }

    // Update product in Firestore with pre-order fields
    const updatedProduct = {
      ...productData,
      categoryName,
      subcategoryName,
      images: updatedImages,
      // Ensure pre-order fields are included
      isPreOrder: productData.isPreOrder !== undefined ? productData.isPreOrder : false,
      preOrderPrice: productData.preOrderPrice || null,
      preOrderStartDate: productData.preOrderStartDate || null,
      preOrderEndDate: productData.preOrderEndDate || null,
      expectedShippingDate: productData.expectedShippingDate || null,
      preOrderStock: productData.preOrderStock || 0,
      preOrderLimit: productData.preOrderLimit || null,
      preOrderMessage: productData.preOrderMessage || '',
      updatedAt: new Date()
    };

    console.log('Updating product in Firestore with data:', updatedProduct);
    await updateDoc(productRef, updatedProduct);
    console.log('Successfully updated product in Firestore');

    // Invalidate relevant caches
    invalidateProductCache('product', productId);
    if (productData.category) {
      invalidateProductCache('category', productData.category);
    }
    if (productData.subcategory) {
      invalidateProductCache('category', productData.subcategory);
    }

    // Return updated product
    const updatedProductData = await getProductById(productId);
    console.log('Retrieved updated product:', updatedProductData);
    return updatedProductData;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required for deletion');
    }

    console.log('Attempting to delete product with ID:', productId);

    // Get product data to delete associated images
    const product = await getProductById(String(productId));
    console.log('Found product:', product.name);

    // Delete images from storage
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          console.log('Attempting to delete image:', imageUrl);

          // Extract the path from Firebase Storage URL
          // Firebase Storage URLs have format: https://firebasestorage.googleapis.com/v0/b/BUCKET_NAME/o/PATH?token=TOKEN
          let path;
          if (imageUrl.includes('firebasestorage.googleapis.com')) {
            const url = new URL(imageUrl);
            // Extract the path from the query parameter
            const pathParts = url.pathname.split('/o/');
            path = pathParts.length > 1 ?
              decodeURIComponent(pathParts[1]) :
              decodeURIComponent(url.pathname.substring(1));
          } else {
            // Fallback for other URL formats
            const url = new URL(imageUrl);
            path = decodeURIComponent(url.pathname.substring(1));
          }

          console.log('Extracted storage path:', path);
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
          console.log('Successfully deleted image:', imageUrl);
        } catch (imageError) {
          console.error('Error deleting image:', imageUrl, imageError);
          // Continue with deletion even if image deletion fails
        }
      }
    }

    // Delete product from Firestore
    console.log('Deleting product document from Firestore');
    const productRef = doc(db, PRODUCTS_COLLECTION, String(productId));
    await deleteDoc(productRef);
    console.log('Successfully deleted product from Firestore');

    // Invalidate relevant caches
    invalidateProductCache('product', productId);
    if (product.category) {
      invalidateProductCache('category', product.category);
    }
    if (product.subcategory) {
      invalidateProductCache('category', product.subcategory);
    }

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Delete product image
export const deleteProductImage = async (productId, imageUrl) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required for image deletion');
    }

    console.log('Attempting to delete image:', imageUrl, 'from product:', productId);

    // Delete image from storage
    // Extract the path from Firebase Storage URL
    let path;
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      const url = new URL(imageUrl);
      // Extract the path from the query parameter
      const pathParts = url.pathname.split('/o/');
      path = pathParts.length > 1 ?
        decodeURIComponent(pathParts[1]) :
        decodeURIComponent(url.pathname.substring(1));
    } else {
      // Fallback for other URL formats
      const url = new URL(imageUrl);
      path = decodeURIComponent(url.pathname.substring(1));
    }

    console.log('Extracted storage path:', path);
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
    console.log('Successfully deleted image from storage');

    // Get current product data
    const product = await getProductById(String(productId));

    // Remove image URL from product images array
    const updatedImages = Array.isArray(product.images) ?
      product.images.filter(url => url !== imageUrl) : [];

    // Update product in Firestore
    const productRef = doc(db, PRODUCTS_COLLECTION, String(productId));
    await updateDoc(productRef, {
      images: updatedImages,
      updatedAt: new Date()
    });

    // Invalidate product cache
    invalidateProductCache('product', productId);

    console.log('Successfully updated product in Firestore');
    return updatedImages;
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw error;
  }
};

// Get featured products (using optimized query service)
export const getFeaturedProducts = async (limitCount = 8) => {
  try {
    const { getFeaturedProducts: optimizedFunction } = await import('./productQueryService');
    return await optimizedFunction(limitCount);
  } catch (error) {
    throw error;
  }
};

// Update product stock
// Uses a Firebase transaction so concurrent orders can never both read the same
// stock value and both succeed (no race condition), and never lets stock go
// negative — if the requested reduction would exceed available stock, it throws
// instead of silently clamping to 0.
export const updateProductStock = async (productId, stockChange) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required for stock update');
    }

    const productRef = doc(db, PRODUCTS_COLLECTION, String(productId));

    const updatedProduct = await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const currentProduct = { id: productDoc.id, ...productDoc.data() };
      const currentStock = currentProduct.stock || 0;
      const newStock = currentStock + stockChange;

      if (newStock < 0) {
        throw new Error(
          `Not enough stock available for "${currentProduct.name || productId}". Only ${currentStock} left, but ${Math.abs(stockChange)} requested.`
        );
      }

      transaction.update(productRef, {
        stock: newStock,
        updatedAt: new Date()
      });

      return { ...currentProduct, stock: newStock };
    });

    // Invalidate stock-related caches
    invalidateProductCache('product', productId);
    invalidateProductCache('stock');

    return updatedProduct;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

// Check if product is available for pre-order
export const isProductAvailableForPreOrder = async (productId) => {
  try {
    if (!productId) {
      console.error('Product ID is required for pre-order check');
      return false;
    }

    const product = await getProductById(String(productId));

    // Check if product is marked as pre-order
    if (!product.isPreOrder) {
      return false;
    }

    const now = new Date();

    // Check if pre-order period is active
    if (product.preOrderStartDate && new Date(product.preOrderStartDate) > now) {
      return false; // Pre-order hasn't started yet
    }

    if (product.preOrderEndDate && new Date(product.preOrderEndDate) < now) {
      return false; // Pre-order has ended
    }

    // Check if there's pre-order stock available
    if ((product.preOrderStock || 0) <= 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking pre-order availability:', error);
    return false;
  }
};

// Check if a product is in stock or available for pre-order
export const isProductInStock = async (productId) => {
  try {
    if (!productId) {
      console.error('Product ID is required for stock check');
      return false;
    }

    const product = await getProductById(String(productId));

    // First check if regular stock is available
    if ((product.stock || 0) > 0) {
      return true;
    }

    // If no regular stock, check if pre-order is available
    return await isProductAvailableForPreOrder(productId);
  } catch (error) {
    console.error('Error checking product stock:', error);
    return false;
  }
};

// Validate pre-order stock
export const validatePreOrderStock = async (productId, quantity = 1) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required for pre-order validation');
    }

    const product = await getProductById(String(productId));

    if (!product.isPreOrder) {
      return { valid: false, message: 'Product is not available for pre-order' };
    }

    const now = new Date();

    // Check pre-order period
    if (product.preOrderStartDate && new Date(product.preOrderStartDate) > now) {
      return { valid: false, message: 'Pre-order has not started yet' };
    }

    if (product.preOrderEndDate && new Date(product.preOrderEndDate) < now) {
      return { valid: false, message: 'Pre-order period has ended' };
    }

    // Check stock availability
    if ((product.preOrderStock || 0) < quantity) {
      return { valid: false, message: 'Insufficient pre-order stock' };
    }

    return { valid: true, message: 'Pre-order available' };
  } catch (error) {
    console.error('Error validating pre-order stock:', error);
    return { valid: false, message: 'Error validating pre-order stock' };
  }
};

// Check if customer has reached pre-order limit
export const checkCustomerPreOrderLimit = async (productId, userId, quantity = 1) => {
  try {
    if (!productId || !userId) {
      throw new Error('Product ID and User ID are required for pre-order limit check');
    }

    const product = await getProductById(String(productId));

    if (!product.isPreOrder || !product.preOrderLimit) {
      return { valid: true, message: 'No pre-order limit or product is not a pre-order' };
    }

    // Import orderService to check customer's existing pre-orders
    const { getOrdersByUserId } = await import('./orderService');
    const customerOrders = await getOrdersByUserId(userId);

    // Count pre-orders for this product
    let preOrderCount = 0;
    for (const order of customerOrders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.productId === productId && item.isPreOrder) {
            preOrderCount += item.quantity || 1;
          }
        }
      }
    }

    // Check if adding this quantity would exceed the limit
    if (preOrderCount + quantity > product.preOrderLimit) {
      return {
        valid: false,
        message: `Pre-order limit exceeded. You can only order ${product.preOrderLimit} units of this product.`,
        currentCount: preOrderCount,
        limit: product.preOrderLimit
      };
    }

    return { valid: true, message: 'Within pre-order limit' };
  } catch (error) {
    console.error('Error checking pre-order limit:', error);
    return { valid: false, message: 'Error checking pre-order limit' };
  }
};

// Get pre-order pricing for a product
export const getPreOrderPricing = async (productId) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required for pre-order pricing');
    }

    const product = await getProductById(String(productId));

    if (!product.isPreOrder) {
      return {
        isPreOrder: false,
        price: product.price || 0,
        originalPrice: product.price || 0
      };
    }

    // If pre-order has special pricing, use it
    if (product.preOrderPrice && product.preOrderPrice > 0) {
      return {
        isPreOrder: true,
        price: product.preOrderPrice,
        originalPrice: product.price || 0,
        savings: (product.price || 0) - product.preOrderPrice
      };
    }

    // Otherwise use regular pricing
    return {
      isPreOrder: true,
      price: product.price || 0,
      originalPrice: product.price || 0
    };
  } catch (error) {
    console.error('Error getting pre-order pricing:', error);
    return {
      isPreOrder: false,
      price: 0,
      originalPrice: 0
    };
  }
};

// Update pre-order stock
// Same transaction-safe, never-negative pattern as updateProductStock above.
export const updatePreOrderStock = async (productId, stockChange) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required for pre-order stock update');
    }

    const productRef = doc(db, PRODUCTS_COLLECTION, String(productId));

    const updatedProduct = await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const currentProduct = { id: productDoc.id, ...productDoc.data() };
      const currentPreOrderStock = currentProduct.preOrderStock || 0;
      const newPreOrderStock = currentPreOrderStock + stockChange;

      if (newPreOrderStock < 0) {
        throw new Error(
          `Not enough pre-order stock available for "${currentProduct.name || productId}". Only ${currentPreOrderStock} left, but ${Math.abs(stockChange)} requested.`
        );
      }

      transaction.update(productRef, {
        preOrderStock: newPreOrderStock,
        updatedAt: new Date()
      });

      return { ...currentProduct, preOrderStock: newPreOrderStock };
    });

    // Invalidate relevant caches
    invalidateProductCache('product', productId);

    return updatedProduct;
  } catch (error) {
    console.error('Error updating pre-order stock:', error);
    throw error;
  }
};

// Get products that are available for pre-order
export const getPreOrderProducts = async (limitCount = 10) => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const now = new Date();

    // Query for products that are marked as pre-order
    const q = query(
      productsRef,
      where('isPreOrder', '==', true),
      where('preOrderStock', '>', 0),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter products based on pre-order dates
    return products.filter(product => {
      // Check if pre-order period is active
      if (product.preOrderStartDate && new Date(product.preOrderStartDate) > now) {
        return false;
      }

      if (product.preOrderEndDate && new Date(product.preOrderEndDate) < now) {
        return false;
      }

      return true;
    });
  } catch (error) {
    console.error('Error getting pre-order products:', error);
    throw error;
  }
};

// Get products with stock information (using optimized query service)
export const getProductsWithStock = async () => {
  try {
    return await getProductsByFilters({}, { includeStock: true });
  } catch (error) {
    console.error('Error getting products with stock:', error);
    throw error;
  }
};

// Batch fetch multiple products by IDs
export const getProductsByIds = async (productIds) => {
  try {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    // Remove duplicates
    const uniqueIds = [...new Set(productIds)];

    // Check cache first for each product
    const cachedProducts = {};
    const uncachedIds = [];

    for (const id of uniqueIds) {
      const cached = await getProductById(id);
      if (cached) {
        cachedProducts[id] = cached;
      } else {
        uncachedIds.push(id);
      }
    }

    // Fetch uncached products in batches
    const batchSize = 10; // Firestore 'in' query limit is 10
    const products = [];

    for (let i = 0; i < uncachedIds.length; i += batchSize) {
      const batch = uncachedIds.slice(i, i + batchSize);
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(productsRef, where('__name__', 'in', batch));
      const querySnapshot = await getDocs(q);

      const batchProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      products.push(...batchProducts);
    }

    // Combine cached and fetched products
    const allProducts = [...products];

    // Add cached products to the result
    Object.values(cachedProducts).forEach(product => {
      if (!allProducts.find(p => p.id === product.id)) {
        allProducts.push(product);
      }
    });

    return allProducts;
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    throw error;
  }
};