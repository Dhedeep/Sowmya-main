import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import {
  upsertUserSearchIndex,
  removeUserSearchIndex,
  searchUsersIndexed
} from './userSearchService';

const USERS_COLLECTION = 'users';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// Update user data
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
    
    // Update search index
    try {
      const updatedUser = await getUserById(userId);
      await upsertUserSearchIndex(updatedUser);
    } catch (indexError) {
      console.error('Error updating user search index:', indexError);
      // Don't throw here as the main operation succeeded
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Update user role (admin only)
export const updateUserRole = async (userId, isAdmin) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isAdmin,
      updatedAt: new Date()
    });
    
    // Update search index
    try {
      const updatedUser = await getUserById(userId);
      await upsertUserSearchIndex(updatedUser);
    } catch (indexError) {
      console.error('Error updating user search index:', indexError);
      // Don't throw here as the main operation succeeded
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
    
    // Remove from search index
    try {
      await removeUserSearchIndex(userId);
    } catch (indexError) {
      console.error('Error removing user search index:', indexError);
      // Don't throw here as the main operation succeeded
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (isAdmin) => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(
      usersRef, 
      where('isAdmin', '==', isAdmin),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

// Search users (now using indexed search)
export const searchUsers = async (searchTerm, options = {}) => {
  try {
    // Use the new indexed search
    return await searchUsersIndexed(searchTerm, options);
  } catch (error) {
    console.error('Error searching users with index, falling back to legacy search:', error);
    
    // Fallback to legacy search if indexed search fails
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        const searchString = `${userData.displayName} ${userData.email}`.toLowerCase();
        if (searchString.includes(searchTerm.toLowerCase())) {
          users.push(userData);
        }
      });
      
      return users;
    } catch (fallbackError) {
      console.error('Error in fallback search:', fallbackError);
      throw fallbackError;
    }
  }
};

// Get user statistics (admin only)
export const getUserStatistics = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    const stats = {
      total: 0,
      admins: 0,
      customers: 0,
      recent: 0
    };
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      stats.total++;
      
      if (user.isAdmin) {
        stats.admins++;
      } else {
        stats.customers++;
      }
      
      const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      if (createdAt > thirtyDaysAgo) {
        stats.recent++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

// Update user status (active/inactive)
export const updateUserStatus = async (userId, isActive) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isActive,
      updatedAt: new Date()
    });
    
    // Update search index
    try {
      const updatedUser = await getUserById(userId);
      await upsertUserSearchIndex(updatedUser);
    } catch (indexError) {
      console.error('Error updating user search index:', indexError);
      // Don't throw here as the main operation succeeded
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Create user (with search index integration)
export const createUser = async (userData) => {
  try {
    const userRef = doc(collection(db, USERS_COLLECTION));
    const userId = userRef.id;
    
    const newUser = {
      ...userData,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: userData.isActive !== false, // Default to true
      isAdmin: userData.isAdmin || false // Default to false
    };
    
    await setDoc(userRef, newUser);
    
    // Add to search index
    try {
      await upsertUserSearchIndex(newUser);
    } catch (indexError) {
      console.error('Error creating user search index:', indexError);
      // Don't throw here as the main operation succeeded
    }
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Initialize user search index for existing users
export const initializeUserSearchIndex = async () => {
  try {
    console.log('Initializing user search index for existing users...');
    
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    let processedCount = 0;
    const batchSize = 10; // Process in smaller batches to avoid overwhelming
    
    for (const userDoc of querySnapshot.docs) {
      const userData = { id: userDoc.id, ...userDoc.data() };
      
      try {
        await upsertUserSearchIndex(userData);
        processedCount++;
        
        if (processedCount % batchSize === 0) {
          console.log(`Processed ${processedCount} users...`);
        }
      } catch (indexError) {
        console.error(`Error indexing user ${userData.id}:`, indexError);
      }
    }
    
    console.log(`User search index initialization complete. Processed ${processedCount} users.`);
    return processedCount;
  } catch (error) {
    console.error('Error initializing user search index:', error);
    throw error;
  }
};