import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';

const SETTINGS_COLLECTION = 'siteSettings';
const GLOBAL_SETTINGS_DOC = 'globalSettings';

// Default settings as fallback
export const DEFAULT_SETTINGS = {
    shippingType: 'flat',
    flatShippingPrice: 50,
    localShippingPrice: 40,
    outsideShippingPrice: 80,
    freeShippingAbove: 999,
    taxEnabled: true,
    taxType: 'GST',
    taxPercentage: 5,
    applyTaxTo: 'both',
    updatedAt: new Date()
};

/**
 * Get the global site settings once
 */
export const getGlobalSettings = async () => {
    try {
        const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
            return { id: settingsDoc.id, ...settingsDoc.data() };
        } else {
            // If doc doesn't exist, create it with defaults
            await setDoc(settingsRef, DEFAULT_SETTINGS);
            return { id: GLOBAL_SETTINGS_DOC, ...DEFAULT_SETTINGS };
        }
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return DEFAULT_SETTINGS;
    }
};

/**
 * Subscribe to global site settings in real-time
 */
export const subscribeToGlobalSettings = (onUpdate, onError) => {
    const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);

    return onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            onUpdate({ id: snapshot.id, ...snapshot.data() });
        } else {
            // If doc disappears or doesn't exist yet, provide defaults and attempt initialization
            onUpdate(DEFAULT_SETTINGS);
            setDoc(settingsRef, DEFAULT_SETTINGS).catch(console.error);
        }
    }, (error) => {
        console.error('Real-time settings sync error:', error);
        if (onError) onError(error);
    });
};

/**
 * Update global settings (Admin only)
 */
export const updateGlobalSettings = async (settingsData, adminUid) => {
    try {
        const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
        const dataToSave = {
            ...settingsData,
            updatedAt: serverTimestamp(),
            updatedBy: adminUid
        };

        await setDoc(settingsRef, dataToSave, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error updating site settings:', error);
        throw error;
    }
};

/**
 * Pure function to calculate order totals
 */
export const calculateOrderTotals = (subtotal, userLocation = 'outside', settings = DEFAULT_SETTINGS) => {
    let shipping = 0;

    // 1. Calculate Shipping
    switch (settings.shippingType) {
        case 'flat':
            shipping = Number(settings.flatShippingPrice) || 0;
            break;
        case 'location':
            shipping = userLocation === 'local'
                ? (Number(settings.localShippingPrice) || 0)
                : (Number(settings.outsideShippingPrice) || 0);
            break;
        case 'free_above':
            if (subtotal >= (Number(settings.freeShippingAbove) || 0)) {
                shipping = 0;
            } else {
                shipping = Number(settings.flatShippingPrice) || 0;
            }
            break;
        default:
            shipping = Number(settings.flatShippingPrice) || 0;
    }

    // 2. Calculate Tax (GST)
    let tax = 0;
    if (settings.taxEnabled) {
        const taxRate = (Number(settings.taxPercentage) || 0) / 100;

        switch (settings.applyTaxTo) {
            case 'products':
                tax = subtotal * taxRate;
                break;
            case 'shipping':
                tax = shipping * taxRate;
                break;
            case 'both':
                tax = (subtotal + shipping) * taxRate;
                break;
        }
    }

    // Rounding to 2 decimal places
    tax = Math.round(tax * 100) / 100;
    shipping = Math.round(shipping * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    return {
        subtotal,
        shipping,
        tax,
        total
    };
};
