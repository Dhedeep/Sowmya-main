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
  where
} from 'firebase/firestore';
import { db } from '../config';

const CATEGORIES_COLLECTION = 'categories';

// Get all categories
export const getAllCategories = async () => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(categoriesRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const categories = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    
    return categories;
  } catch (error) {
    // If the query fails due to missing index, try without ordering
    if (error.message.includes('The query requires an index')) {
      console.warn('Index not available for ordered query, trying without order');
      const categoriesRef = collection(db, CATEGORIES_COLLECTION);
      const querySnapshot = await getDocs(categoriesRef);
      const categories = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually on client side
      return categories.sort((a, b) => a.name.localeCompare(b.name));
    }
    console.error('Error fetching categories from Firebase:', error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    const categoryDoc = await getDoc(categoryRef);
    
    if (categoryDoc.exists()) {
      return { id: categoryDoc.id, ...categoryDoc.data() };
    } else {
      throw new Error('Category not found');
    }
  } catch (error) {
    throw error;
  }
};

// Get main categories (parent categories only)
export const getMainCategories = async () => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(categoriesRef, where('parentId', '==', null), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const categories = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    
    return categories;
  } catch (error) {
    // If the query fails due to missing index, try without ordering
    if (error.message.includes('The query requires an index')) {
      console.warn('Index not available for ordered query, trying without order');
      const categoriesRef = collection(db, CATEGORIES_COLLECTION);
      const q = query(categoriesRef, where('parentId', '==', null));
      const querySnapshot = await getDocs(q);
      const categories = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually on client side
      return categories.sort((a, b) => a.name.localeCompare(b.name));
    }
    throw error;
  }
};

// Get subcategories by parent ID
export const getSubcategoriesByParentId = async (parentId) => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(categoriesRef, where('parentId', '==', parentId), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const subcategories = [];
    
    querySnapshot.forEach((doc) => {
      subcategories.push({ id: doc.id, ...doc.data() });
    });
    
    return subcategories;
  } catch (error) {
    // If the query fails due to missing index, try without ordering
    if (error.message.includes('The query requires an index')) {
      console.warn('Index not available for ordered query, trying without order');
      const categoriesRef = collection(db, CATEGORIES_COLLECTION);
      const q = query(categoriesRef, where('parentId', '==', parentId));
      const querySnapshot = await getDocs(q);
      const subcategories = [];
      
      querySnapshot.forEach((doc) => {
        subcategories.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort manually on client side
      return subcategories.sort((a, b) => a.name.localeCompare(b.name));
    }
    throw error;
  }
};

// Create new category
export const createCategory = async (categoryData) => {
  try {
    const categoriesRef = collection(db, CATEGORIES_COLLECTION);
    const newCategory = {
      name: categoryData.name,
      description: categoryData.description || '',
      parentId: categoryData.parentId || null,
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(categoriesRef, newCategory);
    return { id: docRef.id, ...newCategory };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update category
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    
    const updatedCategory = {
      ...categoryData,
      updatedAt: new Date()
    };
    
    await updateDoc(categoryRef, updatedCategory);
    
    // Return updated category
    return await getCategoryById(categoryId);
  } catch (error) {
    throw error;
  }
};

// Delete category
export const deleteCategory = async (categoryId) => {
  try {
    // Check if category has subcategories
    const subcategories = await getSubcategoriesByParentId(categoryId);
    if (subcategories.length > 0) {
      throw new Error('Cannot delete category with subcategories. Please delete subcategories first.');
    }
    
    // Delete category from Firestore
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(categoryRef);
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Toggle category status
export const toggleCategoryStatus = async (categoryId) => {
  try {
    const category = await getCategoryById(categoryId);
    const updatedStatus = !category.isActive;
    
    await updateCategory(categoryId, { isActive: updatedStatus });
    
    return updatedStatus;
  } catch (error) {
    throw error;
  }
};

// Get category statistics
export const getCategoryStatistics = async () => {
  try {
    const categories = await getAllCategories();
    const mainCategories = categories.filter(cat => !cat.parentId);
    const subcategories = categories.filter(cat => cat.parentId);
    const activeCategories = categories.filter(cat => cat.isActive);
    
    return {
      total: categories.length,
      main: mainCategories.length,
      subcategories: subcategories.length,
      active: activeCategories.length
    };
  } catch (error) {
    throw error;
  }
};

// Get categories with subcategories (nested structure)
export const getCategoriesWithSubcategories = async () => {
  try {
    const allCategories = await getAllCategories();
    const mainCategories = allCategories.filter(cat => !cat.parentId);
    
    const categoriesWithSubcategories = await Promise.all(
      mainCategories.map(async (mainCategory) => {
        const subcategories = await getSubcategoriesByParentId(mainCategory.id);
        return {
          ...mainCategory,
          subcategories
        };
      })
    );
    
    return categoriesWithSubcategories;
  } catch (error) {
    throw error;
  }
};