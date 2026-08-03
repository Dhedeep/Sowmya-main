/**
 * User Search Demo
 * Demonstrates the usage of the new indexed search functionality
 */

import { 
  searchUsers,
  initializeUserSearchIndex
} from '../firebase/services/userService';

import { 
  getUserSearchIndexStats,
  rebuildUserSearchIndex
} from '../firebase/services/userSearchService';

/**
 * Demo function to showcase user search capabilities
 */
export const demoUserSearch = async () => {
  console.log('=== User Search Demo ===');
  
  try {
    // Initialize the search index for existing users
    console.log('1. Initializing search index for existing users...');
    const indexedCount = await initializeUserSearchIndex();
    console.log(`   Indexed ${indexedCount} users`);
    
    // Get search index statistics
    console.log('\n2. Getting search index statistics...');
    const stats = await getUserSearchIndexStats();
    console.log('   Search Index Stats:', stats);
    
    // Demo searches
    console.log('\n3. Performing demo searches...');
    
    // Search by name
    console.log('\n   a) Searching by name "john"...');
    const nameResults = await searchUsers('john');
    console.log(`   Found ${nameResults.length} results:`, nameResults.map(u => u.displayName));
    
    // Search by email
    console.log('\n   b) Searching by email "john@example.com"...');
    const emailResults = await searchUsers('john@example.com');
    console.log(`   Found ${emailResults.length} results:`, emailResults.map(u => `${u.displayName} (${u.email})`));
    
    // Search with filters
    console.log('\n   c) Searching for admin users with "admin"...');
    const adminResults = await searchUsers('admin', { adminOnly: true });
    console.log(`   Found ${adminResults.length} admin results:`, adminResults.map(u => u.displayName));
    
    // Search with limit
    console.log('\n   d) Searching for "user" with limit 3...');
    const limitedResults = await searchUsers('user', { limit: 3 });
    console.log(`   Found ${limitedResults.length} results (limited):`, limitedResults.map(u => u.displayName));
    
    // Search inactive users
    console.log('\n   e) Searching for inactive users with "test"...');
    const inactiveResults = await searchUsers('test', { includeInactive: true });
    console.log(`   Found ${inactiveResults.length} results (including inactive):`, 
      inactiveResults.map(u => `${u.displayName} (${u.isActive ? 'active' : 'inactive'})`));
    
    console.log('\n=== Demo completed successfully ===');
    
    return {
      indexedCount,
      stats,
      searchResults: {
        byName: nameResults,
        byEmail: emailResults,
        adminOnly: adminResults,
        limited: limitedResults,
        includeInactive: inactiveResults
      }
    };
  } catch (error) {
    console.error('Error in user search demo:', error);
    throw error;
  }
};

/**
 * Performance comparison between old and new search
 */
export const performanceComparison = async () => {
  console.log('\n=== Performance Comparison ===');
  
  // This would require implementing the old search method for comparison
  // For now, we'll just measure the new search performance
  
  const searchTerms = ['john', 'admin', 'user', 'test', 'example'];
  const results = {};
  
  for (const term of searchTerms) {
    console.log(`\nTesting search term: "${term}"`);
    
    const startTime = performance.now();
    const searchResults = await searchUsers(term);
    const endTime = performance.now();
    
    const searchTime = endTime - startTime;
    
    results[term] = {
      resultCount: searchResults.length,
      searchTime: searchTime
    };
    
    console.log(`  Results: ${searchResults.length}`);
    console.log(`  Time: ${searchTime.toFixed(2)}ms`);
  }
  
  console.log('\n=== Performance Summary ===');
  Object.entries(results).forEach(([term, data]) => {
    console.log(`${term}: ${data.resultCount} results in ${data.searchTime.toFixed(2)}ms`);
  });
  
  return results;
};

/**
 * Rebuild search index demo
 */
export const rebuildSearchIndexDemo = async () => {
  console.log('\n=== Rebuild Search Index Demo ===');
  
  try {
    console.log('Starting search index rebuild...');
    const startTime = performance.now();
    
    const processedCount = await rebuildUserSearchIndex();
    
    const endTime = performance.now();
    const rebuildTime = endTime - startTime;
    
    console.log(`Rebuild completed in ${rebuildTime.toFixed(2)}ms`);
    console.log(`Processed ${processedCount} users`);
    
    // Get updated stats
    const stats = await getUserSearchIndexStats();
    console.log('Updated search index stats:', stats);
    
    return {
      processedCount,
      rebuildTime,
      stats
    };
  } catch (error) {
    console.error('Error rebuilding search index:', error);
    throw error;
  }
};

/**
 * Advanced search demo with various options
 */
export const advancedSearchDemo = async () => {
  console.log('\n=== Advanced Search Demo ===');
  
  const searchOptions = [
    { term: 'john', options: { limit: 5 } },
    { term: 'admin', options: { adminOnly: true } },
    { term: 'user', options: { customerOnly: true } },
    { term: 'test', options: { includeInactive: true } },
    { term: 'example.com', options: { limit: 10 } }
  ];
  
  for (const { term, options } of searchOptions) {
    console.log(`\nSearching for "${term}" with options:`, options);
    
    try {
      const results = await searchUsers(term, options);
      
      console.log(`  Found ${results.length} results:`);
      results.forEach((user, index) => {
        console.log(`    ${index + 1}. ${user.displayName} (${user.email}) - Admin: ${user.isAdmin}, Active: ${user.isActive}`);
        if (user._relevanceScore) {
          console.log(`       Relevance Score: ${user._relevanceScore}`);
        }
      });
    } catch (error) {
      console.error(`  Error searching for "${term}":`, error);
    }
  }
};

// Export all demo functions
export default {
  demoUserSearch,
  performanceComparison,
  rebuildSearchIndexDemo,
  advancedSearchDemo
};