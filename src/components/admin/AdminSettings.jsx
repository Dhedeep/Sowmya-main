import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { updateGlobalSettings } from '../../firebase/services/settingsService';
import { useAdmin } from '../../contexts/AdminContext';
import { Save, Truck, Percent, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
    const { settings, loading: settingsLoading } = useSettings();
    const { user, isAdmin } = useAdmin();
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState({ type: null, message: null });

    // Initialize form data from settings
    useEffect(() => {
        if (settings) {
            setFormData({ ...settings });
        }
    }, [settings]);

    if (settingsLoading || !formData) {
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
        // Allow only positive numbers and decimals
        const numericValue = value.replace(/[^0-9.]/g, '');

        // Prevent multiple decimals
        const parts = numericValue.split('.');
        const sanitizedValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : numericValue;

        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));
    };

    const validateForm = () => {
        if (Number(formData.taxPercentage) < 0 || Number(formData.taxPercentage) > 100) {
            setStatus({ type: 'error', message: 'Tax percentage must be between 0 and 100.' });
            return false;
        }

        const priceFields = [
            'flatShippingPrice',
            'localShippingPrice',
            'outsideShippingPrice',
            'freeShippingAbove'
        ];

        for (const field of priceFields) {
            if (Number(formData[field]) < 0) {
                setStatus({ type: 'error', message: `${field.replace(/([A-Z])/g, ' $1')} cannot be negative.` });
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin || !user) {
            setStatus({ type: 'error', message: 'Unauthorized: Admin access required.' });
            return;
        }

        if (!validateForm()) return;

        setIsSaving(true);
        setStatus({ type: 'info', message: 'Saving settings...' });

        try {
            // Prepare clean data for Firestore
            const dataToSave = {
                shippingType: formData.shippingType || 'flat',
                flatShippingPrice: parseFloat(formData.flatShippingPrice) || 0,
                localShippingPrice: parseFloat(formData.localShippingPrice) || 0,
                outsideShippingPrice: parseFloat(formData.outsideShippingPrice) || 0,
                freeShippingAbove: parseFloat(formData.freeShippingAbove) || 0,
                taxEnabled: !!formData.taxEnabled,
                taxPercentage: parseFloat(formData.taxPercentage) || 0,
                applyTaxTo: formData.applyTaxTo || 'both',
            };

            const result = await updateGlobalSettings(dataToSave, user.uid);

            if (result.success) {
                setStatus({ type: 'success', message: 'Settings saved successfully!' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            let errorMsg = 'Failed to save settings. Please check your permissions.';

            if (error.code === 'permission-denied') {
                errorMsg = 'Permission Denied: You do not have authority to edit system settings.';
            } else if (error.message) {
                errorMsg = error.message;
            }

            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setIsSaving(false);
            // Auto-clear success message
            if (status.type === 'success') {
                setTimeout(() => setStatus({ type: null, message: null }), 5000);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Store Settings</h2>
                    <p className="text-gray-500 text-sm">Manage global shipping and tax configurations</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold"
                >
                    {isSaving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    ) : (
                        <Save size={20} />
                    )}
                    {isSaving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            {status.message && (
                <div className={`mb-8 p-4 rounded-xl flex items-center gap-4 border transition-all animate-fade-in ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                    status.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                        'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                    }`}>
                    <div className="p-2 rounded-full bg-white/50">
                        {status.type === 'success' && <CheckCircle size={20} />}
                        {status.type === 'error' && <AlertTriangle size={20} />}
                        {status.type === 'info' && <Info size={20} />}
                    </div>
                    <span className="font-medium font-poppins">{status.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Configuration */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 border-gray-200">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                            <Truck size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Shipping Rules</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Shipping Calculation Type
                            </label>
                            <select
                                name="shippingType"
                                value={formData.shippingType}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-brand-primary outline-none transition-all bg-white"
                            >
                                <option value="flat">Standard Flat Rate</option>
                                <option value="location">Location Based (Local/Outside)</option>
                                <option value="free_above">Free Above Amount</option>
                            </select>
                        </div>

                        {formData.shippingType === 'flat' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Flat Shipping Rate (&#8377;)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">&#8377;</span>
                                    <input
                                        type="text"
                                        name="flatShippingPrice"
                                        value={formData.flatShippingPrice}
                                        onChange={handlePriceChange}
                                        className="w-full border-2 border-gray-100 rounded-xl p-3 pl-10 focus:border-brand-primary outline-none transition-all bg-white font-bold"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.shippingType === 'location' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Local Shipping Price (&#8377;)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">&#8377;</span>
                                        <input
                                            type="text"
                                            name="localShippingPrice"
                                            value={formData.localShippingPrice}
                                            onChange={handlePriceChange}
                                            className="w-full border-2 border-gray-100 rounded-xl p-3 pl-10 focus:border-brand-primary outline-none transition-all bg-white font-bold"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Outside Shipping Price (&#8377;)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">&#8377;</span>
                                        <input
                                            type="text"
                                            name="outsideShippingPrice"
                                            value={formData.outsideShippingPrice}
                                            onChange={handlePriceChange}
                                            className="w-full border-2 border-gray-100 rounded-xl p-3 pl-10 focus:border-brand-primary outline-none transition-all bg-white font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.shippingType === 'free_above' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Free Shipping Threshold (&#8377;)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">&#8377;</span>
                                        <input
                                            type="text"
                                            name="freeShippingAbove"
                                            value={formData.freeShippingAbove}
                                            onChange={handlePriceChange}
                                            className="w-full border-2 border-gray-100 rounded-xl p-3 pl-10 focus:border-brand-primary outline-none transition-all bg-white font-bold text-brand-primary"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Zero shipping if order is above this amount</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Base Rate (If under threshold) (&#8377;)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">&#8377;</span>
                                        <input
                                            type="text"
                                            name="flatShippingPrice"
                                            value={formData.flatShippingPrice}
                                            onChange={handlePriceChange}
                                            className="w-full border-2 border-gray-100 rounded-xl p-3 pl-10 focus:border-brand-primary outline-none transition-all bg-white font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tax Configuration */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 border-gray-200 flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <Percent size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Tax / GST Rules</h3>
                    </div>

                    <div className="space-y-6 flex-grow">
                        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border-2 border-gray-50">
                            <div>
                                <p className="font-bold text-gray-800">Enable GST Calculation</p>
                                <p className="text-xs text-gray-500">Apply tax automatically at checkout</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="taxEnabled"
                                    checked={formData.taxEnabled}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary shadow-inner"></div>
                            </label>
                        </div>

                        {formData.taxEnabled && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tax Percentage (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="taxPercentage"
                                            value={formData.taxPercentage}
                                            onChange={handlePriceChange}
                                            className="w-full border-2 border-gray-100 rounded-xl p-3 pr-10 focus:border-brand-primary outline-none transition-all bg-white font-bold"
                                            placeholder="e.g. 18"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                    {Number(formData.taxPercentage) > 0 && (
                                        <p className="text-xs text-brand-secondary mt-2 flex items-center gap-1">
                                            <Info size={12} /> Applies as GST on every order
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Apply Tax Policy
                                    </label>
                                    <select
                                        name="applyTaxTo"
                                        value={formData.applyTaxTo}
                                        onChange={handleChange}
                                        className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-brand-primary outline-none transition-all bg-white"
                                    >
                                        <option value="products">Subtotal Only (Products)</option>
                                        <option value="shipping">Shipping Charge Only</option>
                                        <option value="both">Full Total (Subtotal + Shipping)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {!formData.taxEnabled && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-3">
                            <Info size={18} className="text-yellow-600 mt-0.5" />
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                Tax is currently disabled. Customers will only pay the subtotal and shipping costs.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
