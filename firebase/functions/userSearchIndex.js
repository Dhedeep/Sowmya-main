const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

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
 * @param {string} userId - User ID
 * @param {Object} userData - User data object
 * @returns {Promise} - Promise that resolves when the index is updated
 */
const upsertUserSearchIndex = async (userId, userData) => {
  try {
    const searchTerms = generateSearchTerms(userData);
    
    const indexData = {
      userId: userId,
      displayName: userData.displayName || '',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      isAdmin: userData.isAdmin || false,
      isActive: userData.isActive !== false, // Default to true
      searchTerms,
      createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('userSearchIndex').doc(userId).set(indexData, { merge: true });
    
    console.log(`Updated search index for user: ${userId}`);
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
const removeUserSearchIndex = async (userId) => {
  try {
    await db.collection('userSearchIndex').doc(userId).delete();
    
    console.log(`Removed search index for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error removing user search index:', error);
    throw error;
  }
};

/**
 * Cloud Function: Triggered when a user document is created
 * Automatically adds the user to the search index
 */
exports.onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();
    
    try {
      // Add ID to user data for indexing
      const userDataWithId = { ...userData, id: userId };
      await upsertUserSearchIndex(userId, userDataWithId);
      
      console.log(`User ${userId} added to search index on creation`);
      return null;
    } catch (error) {
      console.error(`Error adding user ${userId} to search index on creation:`, error);
      return null;
    }
  });

/**
 * Cloud Function: Triggered when a user document is updated
 * Automatically updates the user in the search index
 */
exports.onUserUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const newUserData = change.after.data();
    
    try {
      // Add ID to user data for indexing
      const userDataWithId = { ...newUserData, id: userId };
      await upsertUserSearchIndex(userId, userDataWithId);
      
      console.log(`User ${userId} updated in search index`);
      return null;
    } catch (error) {
      console.error(`Error updating user ${userId} in search index:`, error);
      return null;
    }
  });

/**
 * Cloud Function: Triggered when a user document is deleted
 * Automatically removes the user from the search index
 */
exports.onUserDelete = functions.firestore
  .document('users/{userId}')
  .onDelete(async (snap, context) => {
    const userId = context.params.userId;
    
    try {
      await removeUserSearchIndex(userId);
      
      console.log(`User ${userId} removed from search index on deletion`);
      return null;
    } catch (error) {
      console.error(`Error removing user ${userId} from search index on deletion:`, error);
      return null;
    }
  });

/**
 * Cloud Function: Rebuild the entire user search index
 * This can be triggered manually via HTTP call
 */
exports.rebuildUserSearchIndex = functions.https.onRequest(async (req, res) => {
  try {
    console.log('Starting user search index rebuild...');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    const batch = db.batch();
    let processedCount = 0;
    const batchSize = 500; // Firestore batch limit
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = { ...userDoc.data(), id: userId };
      const searchTerms = generateSearchTerms(userData);
      
      const indexData = {
        userId: userId,
        displayName: userData.displayName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        isAdmin: userData.isAdmin || false,
        isActive: userData.isActive !== false,
        searchTerms,
        createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const indexRef = db.collection('userSearchIndex').doc(userId);
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
    
    res.status(200).json({
      success: true,
      message: `User search index rebuilt successfully. Processed ${processedCount} users.`,
      processedCount
    });
  } catch (error) {
    console.error('Error rebuilding user search index:', error);
    res.status(500).json({
      success: false,
      message: 'Error rebuilding user search index',
      error: error.message
    });
  }
});

/**
 * Cloud Function: Get search index statistics
 * This can be triggered manually via HTTP call
 */
exports.getUserSearchIndexStats = functions.https.onRequest(async (req, res) => {
  try {
    const indexSnapshot = await db.collection('userSearchIndex').get();
    
    const stats = {
      totalIndexedUsers: indexSnapshot.size,
      activeUsers: 0,
      inactiveUsers: 0,
      adminUsers: 0,
      customerUsers: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };
    
    indexSnapshot.forEach((doc) => {
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
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting user search index stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user search index stats',
      error: error.message
    });
  }
});