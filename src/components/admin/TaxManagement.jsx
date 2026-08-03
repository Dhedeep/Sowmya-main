import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { updateGlobalSettings } from '../../firebase/services/settingsService';
import { useAdmin } from '../../contexts/AdminContext';
import { Save, Percent, Info } from 'lucide-react';

const TaxManagement = () => {
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
                taxPercentage: Number(formData.taxPercentage) || 0
            };

            await updateGlobalSettings(dataToSave, user.uid);
            setMessage({ type: 'success', text: 'Tax settings updated successfully!' });
        } catch (error) {
            console.error('Failed to update tax settings:', error);
            setMessage({ type: 'error', text: 'Error: ' + error.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold dark:text-white">Tax & GST Management</h2>
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
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Percent size={28} />
                    </div>
                    <h3 className="text-xl font-semibold dark:text-white">Tax Configuration</h3>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Enable Tax Calculation</p>
                            <p className="text-sm text-gray-500">Automatically calculate GST during checkout</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="taxEnabled"
                                checked={formData.taxEnabled}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                        </label>
                    </div>

                    {formData.taxEnabled && (
                        <div className="grid grid-cols-1 gap-6 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tax Rate (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="taxPercentage"
                                        value={formData.taxPercentage}
                                        onChange={handlePriceChange}
                                        className="w-full border rounded-lg p-3 pr-8 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 font-bold"
                                        placeholder="e.g. 18"
                                    />
                                    <span className="absolute right-3 top-3 text-gray-400 font-bold">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tax Application Strategy
                                </label>
                                <select
                                    name="applyTaxTo"
                                    value={formData.applyTaxTo}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                                >
                                    <option value="products">Apply to Products Only (Subtotal)</option>
                                    <option value="shipping">Apply to Shipping Only</option>
                                    <option value="both">Apply to Both (Total Summary)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaxManagement;
