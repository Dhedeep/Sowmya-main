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
  where,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config';

const COUPONS_COLLECTION = 'coupons';

// Create new coupon
export const createCoupon = async (couponData) => {
  try {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    const newCoupon = {
      ...couponData,
      code: couponData.code.toUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      usedCount: 0
    };
    
    const docRef = await addDoc(couponsRef, newCoupon);
    return { id: docRef.id, ...newCoupon };
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

// Get all coupons
export const getAllCoupons = async () => {
  try {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    const q = query(couponsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const coupons = [];
    
    querySnapshot.forEach((doc) => {
      coupons.push({ id: doc.id, ...doc.data() });
    });
    
    return coupons;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

// Get coupon by ID
export const getCouponById = async (couponId) => {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    const couponDoc = await getDoc(couponRef);
    
    if (couponDoc.exists()) {
      return { id: couponDoc.id, ...couponDoc.data() };
    } else {
      throw new Error('Coupon not found');
    }
  } catch (error) {
    throw error;
  }
};

// Get coupon by code
export const getCouponByCode = async (code) => {
  try {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    const q = query(couponsRef, where('code', '==', code.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const couponDoc = querySnapshot.docs[0];
    return { id: couponDoc.id, ...couponDoc.data() };
  } catch (error) {
    throw error;
  }
};

// Update coupon
export const updateCoupon = async (couponId, couponData) => {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    const updatedCoupon = {
      ...couponData,
      code: couponData.code ? couponData.code.toUpperCase() : undefined,
      updatedAt: new Date()
    };
    
    await updateDoc(couponRef, updatedCoupon);
    return await getCouponById(couponId);
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

// Delete coupon
export const deleteCoupon = async (couponId) => {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    await deleteDoc(couponRef);
    return true;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

// Validate coupon for use
export const validateCoupon = async (code, userEmail = null, cartTotal = 0) => {
  try {
    const coupon = await getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }
    
    if (!coupon.isActive) {
      return { valid: false, message: 'Coupon is not active' };
    }
    
    // Check if coupon has expired
    if (coupon.expiryDate) {
      const expiryDate = coupon.expiryDate.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
      if (expiryDate < new Date()) {
        return { valid: false, message: 'Coupon has expired' };
      }
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }
    
    // Check if coupon is email-specific
    if (coupon.emailSpecific && coupon.email && userEmail) {
      if (coupon.email.toLowerCase() !== userEmail.toLowerCase()) {
        return { valid: false, message: 'This coupon is not valid for your email' };
      }
    }
    
    // Check minimum order amount
    if (coupon.minimumAmount && cartTotal < coupon.minimumAmount) {
      return { 
        valid: false, 
        message: `Minimum order amount of ₹${coupon.minimumAmount} required to use this coupon` 
      };
    }
    
    return { valid: true, coupon };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, message: 'Error validating coupon' };
  }
};

// Calculate discount for a coupon without incrementing usage count
export const calculateCouponDiscount = async (code, userEmail = null, cartTotal = 0) => {
  try {
    const validation = await validateCoupon(code, userEmail, cartTotal);
    
    if (!validation.valid) {
      return validation;
    }
    
    const coupon = validation.coupon;
    
    // Calculate discount amount
    let discountAmount = 0;
    
    if (coupon.discountType === 'percentage') {
      discountAmount = (coupon.discountValue / 100) * cartTotal;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }
    
    // Apply maximum discount limit if specified
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
    
    return {
      valid: true,
      coupon,
      discountAmount,
      message: 'Coupon validated successfully'
    };
  } catch (error) {
    console.error('Error calculating coupon discount:', error);
    return { valid: false, message: error.message || 'Error calculating coupon discount' };
  }
};

// Apply coupon and increment usage count (called after successful order)
export const applyCouponAfterOrder = async (couponId) => {
  try {
    // Use transaction to safely increment usage count
    await runTransaction(db, async (transaction) => {
      const couponRef = doc(db, COUPONS_COLLECTION, couponId);
      const couponDoc = await transaction.get(couponRef);
      
      if (!couponDoc.exists()) {
        throw new Error('Coupon not found');
      }
      
      const currentData = couponDoc.data();
      
      // Double-check usage limit
      if (currentData.usageLimit && currentData.usedCount >= currentData.usageLimit) {
        throw new Error('Coupon usage limit reached');
      }
      
      // Increment usage count
      transaction.update(couponRef, {
        usedCount: (currentData.usedCount || 0) + 1,
        updatedAt: new Date()
      });
    });
    
    return { success: true, message: 'Coupon usage count updated' };
  } catch (error) {
    console.error('Error updating coupon usage:', error);
    return { success: false, message: error.message || 'Error updating coupon usage' };
  }
};

// Apply coupon and increment usage count (legacy function for backward compatibility)
export const applyCoupon = async (code, userEmail = null, cartTotal = 0) => {
  try {
    const validation = await validateCoupon(code, userEmail, cartTotal);
    
    if (!validation.valid) {
      return validation;
    }
    
    const coupon = validation.coupon;
    
    // Use transaction to safely increment usage count
    await runTransaction(db, async (transaction) => {
      const couponRef = doc(db, COUPONS_COLLECTION, coupon.id);
      const couponDoc = await transaction.get(couponRef);
      
      if (!couponDoc.exists()) {
        throw new Error('Coupon not found');
      }
      
      const currentData = couponDoc.data();
      
      // Double-check usage limit
      if (currentData.usageLimit && currentData.usedCount >= currentData.usageLimit) {
        throw new Error('Coupon usage limit reached');
      }
      
      // Increment usage count
      transaction.update(couponRef, {
        usedCount: (currentData.usedCount || 0) + 1,
        updatedAt: new Date()
      });
    });
    
    // Calculate discount amount
    let discountAmount = 0;
    
    if (coupon.discountType === 'percentage') {
      discountAmount = (coupon.discountValue / 100) * cartTotal;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }
    
    // Apply maximum discount limit if specified
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
    
    return {
      valid: true,
      coupon,
      discountAmount,
      message: 'Coupon applied successfully'
    };
  } catch (error) {
    console.error('Error applying coupon:', error);
    return { valid: false, message: error.message || 'Error applying coupon' };
  }
};

// Get coupons by status
export const getCouponsByStatus = async (isActive) => {
  try {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    const q = query(
      couponsRef, 
      where('isActive', '==', isActive),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const coupons = [];
    
    querySnapshot.forEach((doc) => {
      coupons.push({ id: doc.id, ...doc.data() });
    });
    
    return coupons;
  } catch (error) {
    throw error;
  }
};

// Get coupons by email
export const getCouponsByEmail = async (email) => {
  try {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    const q = query(
      couponsRef, 
      where('email', '==', email),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const coupons = [];
    
    querySnapshot.forEach((doc) => {
      coupons.push({ id: doc.id, ...doc.data() });
    });
    
    return coupons;
  } catch (error) {
    throw error;
  }
};

// Get coupon statistics
export const getCouponStatistics = async () => {
  try {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    const querySnapshot = await getDocs(couponsRef);
    
    const stats = {
      total: 0,
      active: 0,
      inactive: 0,
      expired: 0,
      totalUsed: 0
    };
    
    const now = new Date();
    
    querySnapshot.forEach((doc) => {
      const coupon = doc.data();
      stats.total++;
      stats.totalUsed += coupon.usedCount || 0;
      
      if (coupon.isActive) {
        stats.active++;
      } else {
        stats.inactive++;
      }
      
      // Check if expired
      if (coupon.expiryDate) {
        const expiryDate = coupon.expiryDate.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
        if (expiryDate < now) {
          stats.expired++;
        }
      }
    });
    
    return stats;
  } catch (error) {
    throw error;
  }
};

// Toggle coupon status (activate/deactivate)
export const toggleCouponStatus = async (couponId) => {
  try {
    const coupon = await getCouponById(couponId);
    const updatedCoupon = await updateCoupon(couponId, {
      isActive: !coupon.isActive
    });
    return updatedCoupon;
  } catch (error) {
    throw error;
  }
};