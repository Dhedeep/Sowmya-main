import { createProduct } from './services/productService';
import { registerUser } from './services/authService';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

// Initialize Firebase with sample data
export const initializeFirebaseData = async () => {
  try {
    console.log('Initializing Firebase data...');

    // Create admin user (if not exists)
    try {
      const result = await registerUser(
        'admin@sowmyaselections.com',
        'sowmya@123',
        'Admin User',
        true
      );
      console.log('Admin user created successfully');

      // Ensure admin user document exists in Firestore with proper admin status
      if (result && result.user) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: 'admin@sowmyaselections.com',
          displayName: 'Admin User',
          isAdmin: true,
          createdAt: new Date(),
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }, { merge: true });
        console.log('Admin user document created/updated in Firestore');
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('Admin user already exists in Authentication');

        // Check if admin user document exists in Firestore
        try {
          // We need to get the UID of the admin user, but since we can't directly get it by email,
          // we'll create a placeholder check that will be handled by the admin login process
          console.log('Admin user document will be created/updated during login');
        } catch (docError) {
          console.error('Error checking admin user document:', docError);
        }
      } else {
        console.error('Error creating admin user:', error);
      }
    }

    // Products should be added manually through the admin dashboard
    console.log('Products should be added manually through the admin dashboard');

    console.log('Firebase data initialization completed');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    return false;
  }
};

// Function to check if data is already initialized
export const checkDataInitialized = async () => {
  try {
    const { getAllProducts } = await import('./services/productService');
    const products = await getAllProducts();
    console.log('Checking if data is initialized. Products found:', products.length);
    return products.length > 0;
  } catch (error) {
    console.error('Error checking data initialization:', error);
    return false;
  }
};