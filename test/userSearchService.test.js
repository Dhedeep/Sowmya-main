/**
 * Test suite for User Search Service
 * Tests the indexed search implementation
 */

import { 
  upsertUserSearchIndex, 
  removeUserSearchIndex,
  searchUsersIndexed,
  rebuildUserSearchIndex,
  getUserSearchIndexStats
} from '../src/firebase/services/userSearchService';

// Mock Firebase
jest.mock('../src/firebase/config', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    batch: jest.fn()
  }
}));

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  writeBatch: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

describe('User Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSearchTerms', () => {
    // We'll test this indirectly through the public functions
    // since it's a private function in the service
  });

  describe('upsertUserSearchIndex', () => {
    it('should create a search index entry for a user', async () => {
      const mockUserData = {
        id: 'user123',
        displayName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        isAdmin: false,
        isActive: true,
        createdAt: new Date()
      };

      const mockSetDoc = jest.fn().mockResolvedValue(true);
      require('firebase/firestore').setDoc = mockSetDoc;
      require('firebase/firestore').doc = jest.fn().mockReturnValue({});

      await upsertUserSearchIndex(mockUserData);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: 'user123',
          displayName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
          isAdmin: false,
          isActive: true,
          searchTerms: expect.arrayContaining([
            'john doe',
            'john',
            'doe',
            'jo',
            'joh',
            'john@example.com',
            'john@example',
            'jo',
            'joh',
            '1234567890',
            '1234',
            '12345',
            'user123'
          ])
        }),
        { merge: true }
      );
    });

    it('should handle missing user data gracefully', async () => {
      const mockUserData = {
        id: 'user123'
        // Missing other fields
      };

      const mockSetDoc = jest.fn().mockResolvedValue(true);
      require('firebase/firestore').setDoc = mockSetDoc;
      require('firebase/firestore').doc = jest.fn().mockReturnValue({});

      await upsertUserSearchIndex(mockUserData);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: 'user123',
          displayName: '',
          email: '',
          phoneNumber: '',
          isAdmin: false,
          isActive: true,
          searchTerms: ['user123']
        }),
        { merge: true }
      );
    });

    it('should throw an error when user ID is missing', async () => {
      const mockUserData = {
        displayName: 'John Doe',
        email: 'john@example.com'
        // Missing ID
      };

      await expect(upsertUserSearchIndex(mockUserData)).rejects.toThrow('User ID is required for search indexing');
    });
  });

  describe('searchUsersIndexed', () => {
    it('should search users by name', async () => {
      const searchTerm = 'john';
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'user123',
            data: () => ({
              userId: 'user123',
              displayName: 'John Doe',
              email: 'john@example.com',
              isAdmin: false,
              isActive: true,
              searchTerms: ['john', 'doe', 'john@example.com']
            })
          }
        ]
      };

      const mockGetDocs = jest.fn().mockResolvedValue(mockQuerySnapshot);
      require('firebase/firestore').getDocs = mockGetDocs;
      require('firebase/firestore').collection = jest.fn().mockReturnValue({});
      require('firebase/firestore').query = jest.fn().mockReturnValue({});
      require('firebase/firestore').where = jest.fn().mockReturnValue({});
      require('firebase/firestore').orderBy = jest.fn().mockReturnValue({});
      require('firebase/firestore').limit = jest.fn().mockReturnValue({});

      const results = await searchUsersIndexed(searchTerm);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        id: 'user123',
        displayName: 'John Doe',
        email: 'john@example.com',
        isAdmin: false,
        isActive: true
      });
      expect(results[0]).toHaveProperty('_relevanceScore');
    });

    it('should return empty array for short search terms', async () => {
      const results = await searchUsersIndexed('jo');
      expect(results).toEqual([]);
    });

    it('should apply filters correctly', async () => {
      const searchTerm = 'john';
      const options = {
        limit: 10,
        adminOnly: true,
        includeInactive: false
      };

      const mockGetDocs = jest.fn().mockResolvedValue({ docs: [] });
      require('firebase/firestore').getDocs = mockGetDocs;
      require('firebase/firestore').collection = jest.fn().mockReturnValue({});
      require('firebase/firestore').query = jest.fn().mockReturnValue({});
      require('firebase/firestore').where = jest.fn().mockReturnValue({});
      require('firebase/firestore').orderBy = jest.fn().mockReturnValue({});
      require('firebase/firestore').limit = jest.fn().mockReturnValue({});

      await searchUsersIndexed(searchTerm, options);

      expect(require('firebase/firestore').where).toHaveBeenCalledWith('searchTerms', 'array-contains', 'john');
      expect(require('firebase/firestore').where).toHaveBeenCalledWith('isAdmin', '==', true);
      expect(require('firebase/firestore').where).toHaveBeenCalledWith('isActive', '==', true);
      expect(require('firebase/firestore').limit).toHaveBeenCalledWith(10);
    });
  });

  describe('removeUserSearchIndex', () => {
    it('should remove a user from the search index', async () => {
      const userId = 'user123';
      const mockDeleteDoc = jest.fn().mockResolvedValue(true);
      require('firebase/firestore').deleteDoc = mockDeleteDoc;
      require('firebase/firestore').doc = jest.fn().mockReturnValue({});

      await removeUserSearchIndex(userId);

      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  describe('getUserSearchIndexStats', () => {
    it('should return search index statistics', async () => {
      const mockSnapshot = {
        size: 2,
        forEach: jest.fn((callback) => {
          callback({
            data: () => ({ isAdmin: true, isActive: true })
          });
          callback({
            data: () => ({ isAdmin: false, isActive: false })
          });
        })
      };

      const mockGetDocs = jest.fn().mockResolvedValue(mockSnapshot);
      require('firebase/firestore').getDocs = mockGetDocs;
      require('firebase/firestore').collection = jest.fn().mockReturnValue({});

      const stats = await getUserSearchIndexStats();

      expect(stats).toEqual({
        totalIndexedUsers: 2,
        activeUsers: 1,
        inactiveUsers: 1,
        adminUsers: 1,
        customerUsers: 1
      });
    });
  });

  describe('rebuildUserSearchIndex', () => {
    it('should rebuild the entire search index', async () => {
      const mockUsersSnapshot = {
        docs: [
          {
            id: 'user1',
            data: () => ({
              displayName: 'User One',
              email: 'user1@example.com',
              isAdmin: false,
              isActive: true
            })
          },
          {
            id: 'user2',
            data: () => ({
              displayName: 'User Two',
              email: 'user2@example.com',
              isAdmin: true,
              isActive: false
            })
          }
        ]
      };

      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(true)
      };

      const mockGetDocs = jest.fn().mockResolvedValue(mockUsersSnapshot);
      const mockWriteBatch = jest.fn().mockReturnValue(mockBatch);

      require('firebase/firestore').getDocs = mockGetDocs;
      require('firebase/firestore').collection = jest.fn().mockReturnValue({});
      require('firebase/firestore').writeBatch = mockWriteBatch;
      require('firebase/firestore').doc = jest.fn().mockReturnValue({});
      require('firebase/firestore').serverTimestamp = jest.fn(() => new Date());

      const processedCount = await rebuildUserSearchIndex();

      expect(processedCount).toBe(2);
      expect(mockBatch.set).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });
});

// Integration tests would go here, testing the actual Firebase integration
// These would require a Firebase emulator setup