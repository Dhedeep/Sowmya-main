import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { updateGlobalSettings } from '../../firebase/services/settingsService';
import { useAdmin } from '../../contexts/AdminContext';
import { Save, Truck, Info } from 'lucide-react';

const ShippingFeesManagement = () => {
    const { settings, loading } = useSettings();
    const { user } = useAdmin();
    const [formData, setFormData] = useState(settings ? { ...settings } : null);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (settings && !formData) {
            setFormData({ ...settings });
        }
    }, [settings, formData]);

    if (!formData) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        const numericValue = value.replace(/[^-0-9.]/g, '');
        setFormData(prev => ({
            ...prev,
            [name]: numericValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const dataToSave = {
                ...formData,
                flatShippingPrice: Number(formData.flatShippingPrice) || 0,
                localShippingPrice: Number(formData.localShippingPrice) || 0,
                outsideShippingPrice: Number(formData.outsideShippingPrice) || 0,
                freeShippingAbove: Number(formData.freeShippingAbove) || 0
            };

            await updateGlobalSettings(dataToSave, user.uid);
            setMessage({ type: 'success', text: 'Shipping prices updated successfully!' });
        } catch (error) {
            console.error('Failed to update shipping settings:', error);
            setMessage({ type: 'error', text: 'Error: ' + error.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold dark:text-white">Shipping Fees Management</h2>
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    ) : (
                        <Save size={18} />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <Info size={16} />
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg">
                        <Truck size={28} />
                    </div>
                    <h3 className="text-xl font-semibold dark:text-white">Configure Shipping Rates</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Calculation Model
                        </label>
                        <select
                            name="shippingType"
                            value={formData.shippingType}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-3 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="flat">Standard Flat Rate</option>
                            <option value="location">Distance/Location Based</option>
                            <option value="free_above">Threshold Based (Free Shipping)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-4 border-t dark:border-gray-700">
                        {formData.shippingType === 'flat' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Global Flat Shipping Rate (&#8377;)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">&#8377;</span>
                                    <input
                                        type="text"
                                        name="flatShippingPrice"
                                        value={formData.flatShippingPrice}
                                        onChange={handlePriceChange}
                                        className="w-full border rounded-lg p-3 pl-8 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.shippingType === 'location' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Local Delivery Price (&#8377;)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400">&#8377;</span>
                                        <input
                                            type="text"
                                            name="localShippingPrice"
                                            value={formData.localShippingPrice}
                                            onChange={handlePriceChange}
                                            className="w-full border rounded-lg p-3 pl-8 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Standard Shipping Price (Outstation) (&#8377;)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400">&#8377;</span>
                                        <input
                                            type="text"
                                            name="outsideShippingPrice"
                                            value={formData.outsideShippingPrice}
                                            onChange={handlePriceChange}
                                            className="w-full border rounded-lg p-3 pl-8 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.shippingType === 'free_above' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Free Shipping Threshold Amount (&#8377;)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400">&#8377;</span>
                                        <input
                                            type="text"
                                            name="freeShippingAbove"
                                            value={formData.freeShippingAbove}
                                            onChange={handlePriceChange}
                                            className="w-full border rounded-lg p-3 pl-8 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Orders above this amount will have free shipping.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Standard Charge (If under threshold) (&#8377;)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400">&#8377;</span>
                                        <input
                                            type="text"
                                            name="flatShippingPrice"
                                            value={formData.flatShippingPrice}
                                            onChange={handlePriceChange}
                                            className="w-full border rounded-lg p-3 pl-8 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingFeesManagement;
