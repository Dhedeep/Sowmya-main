import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

const USER_SEARCH_INDEX_COLLECTION = 'userSearchIndex';

/**
 * Generate search terms for a user
 * Breaks down user data into searchable tokens
 * @param {Object} userData - User data object
 * @returns {Array} - Array of search terms
 */
const generateSearchTerms = (userData) => {
  const terms = new Set();
  
  // Add full name and parts
  if (userData.displayName) {
    const name = userData.displayName.toLowerCase();
    terms.add(name);
    
    // Add name parts (first, last, etc.)
    const nameParts = name.split(' ');
    nameParts.forEach(part => {
      if (part.length > 1) {
        terms.add(part);
        // Add partial matches for autocomplete
        for (let i = 2; i <= part.length; i++) {
          terms.add(part.substring(0, i));
        }
      }
    });
  }
  
  // Add email and parts
  if (userData.email) {
    const email = userData.email.toLowerCase();
    terms.add(email);
    
    // Add email parts before @
    const emailLocal = email.split('@')[0];
    if (emailLocal) {
      terms.add(emailLocal);
      // Add partial matches for autocomplete
      for (let i = 2; i <= emailLocal.length; i++) {
        terms.add(emailLocal.substring(0, i));
      }
    }
  }
  
  // Add phone number if available
  if (userData.phoneNumber) {
    const phone = userData.phoneNumber.replace(/\D/g, ''); // Remove non-digits
    if (phone.length >= 4) {
      terms.add(phone);
      // Add partial matches
      for (let i = 4; i <= phone.length; i++) {
        terms.add(phone.substring(0, i));
      }
    }
  }
  
  // Add user ID for exact searches
  if (userData.id) {
    terms.add(userData.id);
  }
  
  return Array.from(terms);
};

/**
 * Create or update a user search index entry
 * @param {Object} userData - User data object
 * @returns {Promise} - Promise that resolves when the index is updated
 */
export const upsertUserSearchIndex = async (userData) => {
  try {
    if (!userData.id) {
      throw new Error('User ID is required for search indexing');
    }
    
    const searchTerms = generateSearchTerms(userData);
    
    const indexData = {
      userId: userData.id,
      displayName: userData.displayName || '',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      isAdmin: userData.isAdmin || false,
      isActive: userData.isActive !== false, // Default to true
      searchTerms,
      createdAt: userData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const indexRef = doc(db, USER_SEARCH_INDEX_COLLECTION, userData.id);
    await setDoc(indexRef, indexData, { merge: true });
    
    console.log(`Updated search index for user: ${userData.id}`);
    return true;
  } catch (error) {
    console.error('Error upserting user search index:', error);
    throw error;
  }
};

/**
 * Remove a user from the search index
 * @param {string} userId - User ID to remove from index
 * @returns {Promise} - Promise that resolves when the index entry is removed
 */
export const removeUserSearchIndex = async (userId) => {
  try {
    const indexRef = doc(db, USER_SEARCH_INDEX_COLLECTION, userId);
    await deleteDoc(indexRef);
    
    console.log(`Removed search index for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error removing user search index:', error);
    throw error;
  }
};

/**
 * Search users using the indexed search
 * @param {string} searchTerm - Search term to look for
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} - Promise that resolves to array of matching users
 */
export const searchUsersIndexed = async (searchTerm, options = {}) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    
    const {
      limit: searchLimit = 20,
      includeInactive = false,
      adminOnly = false,
      customerOnly = false
    } = options;
    
    const searchRef = collection(db, USER_SEARCH_INDEX_COLLECTION);
    const constraints = [];
    
    // Add search term filter
    constraints.push(where('searchTerms', 'array-contains', searchTerm.toLowerCase()));
    
    // Add role filters if specified
    if (adminOnly) {
      constraints.push(where('isAdmin', '==', true));
    } else if (customerOnly) {
      constraints.push(where('isAdmin', '==', false));
    }
    
    // Add active status filter if not including inactive
    if (!includeInactive) {
      constraints.push(where('isActive', '==', true));
    }
    
    // Add ordering and limit
    constraints.push(orderBy('displayName'));
    constraints.push(limit(searchLimit));
    
    const q = query(searchRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const results = [];
    querySnapshot.forEach((doc) => {
      const indexData = { id: doc.id, ...doc.data() };
      // Transform back to user format
      results.push({
        id: indexData.userId,
        displayName: indexData.displayName,
        email: indexData.email,
        phoneNumber: indexData.phoneNumber,
        isAdmin: indexData.isAdmin,
        isActive: indexData.isActive,
        createdAt: indexData.createdAt,
        // Include search relevance score (could be enhanced)
        _relevanceScore: calculateRelevanceScore(searchTerm, indexData)
      });
    });
    
    // Sort by relevance score
    results.sort((a, b) => b._relevanceScore - a._relevanceScore);
    
    return results;
  } catch (error) {
    console.error('Error searching users with index:', error);
    throw error;
  }
};

/**
 * Calculate relevance score for search results
 * @param {string} searchTerm - The original search term
 * @param {Object} indexData - The index data for a user
 * @returns {number} - Relevance score (higher is more relevant)
 */
const calculateRelevanceScore = (searchTerm, indexData) => {
  const searchLower = searchTerm.toLowerCase();
  let score = 0;
  
  // Exact name match gets highest score
  if (indexData.displayName && indexData.displayName.toLowerCase() === searchLower) {
    score += 100;
  }
  
  // Name starts with search term
  if (indexData.displayName && indexData.displayName.toLowerCase().startsWith(searchLower)) {
    score += 50;
  }
  
  // Email exact match
  if (indexData.email && indexData.email.toLowerCase() === searchLower) {
    score += 80;
  }
  
  // Email starts with search term
  if (indexData.email && indexData.email.toLowerCase().startsWith(searchLower)) {
    score += 40;
  }
  
  // Phone number match
  if (indexData.phoneNumber) {
    const cleanPhone = indexData.phoneNumber.replace(/\D/g, '');
    const cleanSearch = searchTerm.replace(/\D/g, '');
    if (cleanPhone.includes(cleanSearch)) {
      score += 30;
    }
  }
  
  // User ID exact match
  if (indexData.userId === searchTerm) {
    score += 90;
  }
  
  // Bonus for admin users (if searching admin users)
  if (indexData.isAdmin) {
    score += 5;
  }
  
  return score;
};

/**
 * Rebuild the entire user search index
 * This should be run periodically or when the index structure changes
 * @returns {Promise} - Promise that resolves when the index is rebuilt
 */
export const rebuildUserSearchIndex = async () => {
  try {
    console.log('Starting user search index rebuild...');
    
    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const batch = writeBatch(db);
    let processedCount = 0;
    const batchSize = 500; // Firestore batch limit
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = { id: userDoc.id, ...userDoc.data() };
      const searchTerms = generateSearchTerms(userData);
      
      const indexData = {
        userId: userData.id,
        displayName: userData.displayName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        isAdmin: userData.isAdmin || false,
        isActive: userData.isActive !== false,
        searchTerms,
        createdAt: userData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const indexRef = doc(db, USER_SEARCH_INDEX_COLLECTION, userData.id);
      batch.set(indexRef, indexData);
      
      processedCount++;
      
      // Commit batch when it reaches the limit
      if (processedCount % batchSize === 0) {
        await batch.commit();
        console.log(`Processed ${processedCount} users...`);
      }
    }
    
    // Commit any remaining operations
    if (processedCount % batchSize !== 0) {
      await batch.commit();
    }
    
    console.log(`User search index rebuilt successfully. Processed ${processedCount} users.`);
    return processedCount;
  } catch (error) {
    console.error('Error rebuilding user search index:', error);
    throw error;
  }
};

/**
 * Get search index statistics
 * @returns {Promise<Object>} - Promise that resolves to index statistics
 */
export const getUserSearchIndexStats = async () => {
  try {
    const indexRef = collection(db, USER_SEARCH_INDEX_COLLECTION);
    const snapshot = await getDocs(indexRef);
    
    const stats = {
      totalIndexedUsers: snapshot.size,
      activeUsers: 0,
      inactiveUsers: 0,
      adminUsers: 0,
      customerUsers: 0
    };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive) {
        stats.activeUsers++;
      } else {
        stats.inactiveUsers++;
      }
      
      if (data.isAdmin) {
        stats.adminUsers++;
      } else {
        stats.customerUsers++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting user search index stats:', error);
    throw error;
  }
};