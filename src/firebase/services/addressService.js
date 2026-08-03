import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config';

const ADDRESSES_COLLECTION = 'addresses';

// Get user's addresses
export const getUserAddresses = async (userId) => {
  try {
    const addressesRef = doc(db, ADDRESSES_COLLECTION, userId);
    const addressesDoc = await getDoc(addressesRef);

    if (addressesDoc.exists()) {
      return addressesDoc.data().addresses || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

// Save user's addresses
export const saveUserAddresses = async (userId, addresses) => {
  try {
    const addressesRef = doc(db, ADDRESSES_COLLECTION, userId);
    await setDoc(addressesRef, {
      userId,
      addresses,
      updatedAt: new Date()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user addresses:', error);
    throw error;
  }
};

// Add new address
export const addUserAddress = async (userId, address) => {
  try {
    const addressesRef = doc(db, ADDRESSES_COLLECTION, userId);
    const addressesDoc = await getDoc(addressesRef);

    let addresses = [];
    if (addressesDoc.exists()) {
      addresses = addressesDoc.data().addresses || [];
    }

    // If new address is default, remove default from other addresses
    if (address.isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    // Add new address with ID
    const newAddress = {
      ...address,
      id: Date.now().toString()
    };

    addresses.push(newAddress);

    await setDoc(addressesRef, {
      userId,
      addresses,
      updatedAt: new Date()
    }, { merge: true });

    return newAddress;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

// Update existing address
export const updateUserAddress = async (userId, addressId, updatedAddress) => {
  try {
    const addressesRef = doc(db, ADDRESSES_COLLECTION, userId);
    const addressesDoc = await getDoc(addressesRef);

    if (!addressesDoc.exists()) {
      throw new Error('Addresses not found');
    }

    let addresses = addressesDoc.data().addresses || [];

    // If updated address is default, remove default from other addresses
    if (updatedAddress.isDefault) {
      addresses = addresses.map(addr =>
        addr.id === addressId
          ? { ...updatedAddress, id: addressId }
          : { ...addr, isDefault: false }
      );
    } else {
      addresses = addresses.map(addr =>
        addr.id === addressId
          ? { ...updatedAddress, id: addressId }
          : addr
      );
    }

    await updateDoc(addressesRef, {
      addresses,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// Delete address
export const deleteUserAddress = async (userId, addressId) => {
  try {
    const addressesRef = doc(db, ADDRESSES_COLLECTION, userId);
    const addressesDoc = await getDoc(addressesRef);

    if (!addressesDoc.exists()) {
      throw new Error('Addresses not found');
    }

    const addresses = addressesDoc.data().addresses || [];
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);

    await updateDoc(addressesRef, {
      addresses: updatedAddresses,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// Set default address
export const setDefaultAddress = async (userId, addressId) => {
  try {
    const addressesRef = doc(db, ADDRESSES_COLLECTION, userId);
    const addressesDoc = await getDoc(addressesRef);

    if (!addressesDoc.exists()) {
      throw new Error('Addresses not found');
    }

    const addresses = addressesDoc.data().addresses || [];
    const updatedAddresses = addresses.map(addr =>
      addr.id === addressId
        ? { ...addr, isDefault: true }
        : { ...addr, isDefault: false }
    );

    await updateDoc(addressesRef, {
      addresses: updatedAddresses,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

// ============================================================
// Save shipping address as default after successful order
// Checks for existing match to avoid duplicates
// ============================================================

/**
 * Save a shipping address as default after order placement.
 * - If a matching address already exists, mark it as default.
 * - If no match, add as new + mark as default.
 * - All other addresses have isDefault set to false.
 * @param {string} userId - User ID
 * @param {Object} shippingAddress - The shipping address from checkout form
 * @returns {Promise<boolean>} - Success status
 */
export const saveAddressAsDefault = async (userId, shippingAddress) => {
  try {
    if (!userId || !shippingAddress) return false;

    const addressesRef = doc(db, ADDRESSES_COLLECTION, userId);
    const addressesDoc = await getDoc(addressesRef);

    let addresses = [];
    if (addressesDoc.exists()) {
      addresses = addressesDoc.data().addresses || [];
    }

    // Normalize for comparison (trim + lowercase)
    const normalize = (str) => (str || '').trim().toLowerCase();

    // Check if this address already exists (match on key fields)
    const matchIndex = addresses.findIndex(addr =>
      normalize(addr.address || addr.line1) === normalize(shippingAddress.address) &&
      normalize(addr.city) === normalize(shippingAddress.city) &&
      normalize(addr.pincode || addr.postcode) === normalize(shippingAddress.pincode)
    );

    // Clear all existing defaults
    addresses = addresses.map(addr => ({ ...addr, isDefault: false }));

    if (matchIndex !== -1) {
      // Address exists — mark as default and update fields
      addresses[matchIndex] = {
        ...addresses[matchIndex],
        name: shippingAddress.fullName || addresses[matchIndex].name,
        phone: shippingAddress.phone || addresses[matchIndex].phone,
        address: shippingAddress.address || addresses[matchIndex].address,
        city: shippingAddress.city || addresses[matchIndex].city,
        state: shippingAddress.state || addresses[matchIndex].state,
        postcode: shippingAddress.pincode || addresses[matchIndex].postcode,
        country: shippingAddress.country || addresses[matchIndex].country || 'India',
        isDefault: true
      };
    } else {
      // New address — add and mark as default
      addresses.push({
        id: Date.now().toString(),
        name: shippingAddress.fullName || '',
        phone: shippingAddress.phone || '',
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postcode: shippingAddress.pincode || '',
        country: shippingAddress.country || 'India',
        isDefault: true,
        createdAt: new Date()
      });
    }

    await setDoc(addressesRef, {
      userId,
      addresses,
      updatedAt: new Date()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error saving address as default:', error);
    // Non-blocking — don't throw, just return false
    return false;
  }
};

/**
 * Get the default address for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Default address or null
 */
export const getDefaultAddress = async (userId) => {
  try {
    if (!userId) return null;
    const addresses = await getUserAddresses(userId);
    return addresses.find(addr => addr.isDefault) || null;
  } catch (error) {
    console.error('Error getting default address:', error);
    return null;
  }
};