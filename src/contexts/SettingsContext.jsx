import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToGlobalSettings, calculateOrderTotals, DEFAULT_SETTINGS } from '../firebase/services/settingsService';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Subscribe to real-time updates from Firestore
        const unsubscribe = subscribeToGlobalSettings(
            (data) => {
                setSettings(data);
                setLoading(false);
            },
            (err) => {
                console.error('SettingsContext sync failed:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Helper to calculate totals using the current settings
    const getTotals = (subtotal, userLocation) => {
        if (!settings) return null;
        return calculateOrderTotals(subtotal, userLocation, settings);
    };

    const value = {
        settings,
        loading,
        error,
        getTotals
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
