/**
 * Firebase Functions Index
 * 
 * This file exports all Firebase Cloud Functions for the application.
 */

const orderStats = require('./orderStatistics');
const userSearchIndex = require('./userSearchIndex');

// Export order statistics functions
module.exports = {
  // Order statistics triggers
  onOrderCreated: orderStats.onOrderCreated,
  onOrderUpdated: orderStats.onOrderUpdated,
  onOrderDeleted: orderStats.onOrderDeleted,
  
  // Scheduled functions
  updateOrderStatisticsDaily: orderStats.updateOrderStatisticsDaily,
  
  // HTTP functions
  manualUpdateOrderStatistics: orderStats.manualUpdateOrderStatistics,
  
  // Helper functions
  calculateOrderStatistics: orderStats.calculateOrderStatistics,
  
  // User search index triggers
  onUserCreate: userSearchIndex.onUserCreate,
  onUserUpdate: userSearchIndex.onUserUpdate,
  onUserDelete: userSearchIndex.onUserDelete,
  
  // User search index HTTP functions
  rebuildUserSearchIndex: userSearchIndex.rebuildUserSearchIndex,
  getUserSearchIndexStats: userSearchIndex.getUserSearchIndexStats
};