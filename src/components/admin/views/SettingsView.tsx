import { TrendingUp, Briefcase, Loader2, CreditCard, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { AppSettings } from '../../../types/admin';
import { REGISTRATION_PRICES } from '../../../constants/pricing';
import toast from 'react-hot-toast';

const ChangePasswordSection = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            toast.error('Please enter your current password');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword === currentPassword) {
            toast.error('New password must be different from current password');
            return;
        }
        try {
            setIsSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) throw new Error('Unable to verify signed-in admin');

            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });
            if (verifyError) {
                toast.error('Current password is incorrect');
                return;
            }

            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success('Admin password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <KeyRound size={20} className="text-[#007F00]" />
                Change Admin Password
            </h3>
            <p className="text-xs text-gray-500 mb-4">Enter your current password to confirm it's you, then set a new password.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                        <input
                            type={showCurrent ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="Enter current password"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-[#007F00] focus:border-[#007F00]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent((v) => !v)}
                            className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                            aria-label={showCurrent ? 'Hide password' : 'Show password'}
                        >
                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={8}
                                required
                                autoComplete="new-password"
                                placeholder="At least 8 characters"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-[#007F00] focus:border-[#007F00]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((v) => !v)}
                                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                                aria-label={showNew ? 'Hide password' : 'Show password'}
                            >
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                required
                                autoComplete="new-password"
                                placeholder="Re-enter new password"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-[#007F00] focus:border-[#007F00]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                        className="bg-[#007F00] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />}
                        {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

interface PromoSettings {
    id: number;
    is_enabled: boolean;
    headline: string;
    sub_text: string;
    image_url: string;
    destination_url: string;
}

interface Props {
    appSettings: AppSettings | null;
    promoSettings: PromoSettings;
    setPromoSettings: (v: PromoSettings) => void;
    isSavingSettings: boolean;
    setIsSavingSettings: (v: boolean) => void;
    isSavingRegistrationFees: boolean;
    setIsSavingRegistrationFees: (v: boolean) => void;
    isSavingSubscription: boolean;
    setIsSavingSubscription: (v: boolean) => void;
    isUpdatingBanner: boolean;
    fetchAppSettings: () => void;
    savePromoSettings: (e: React.FormEvent) => void;
}

export const SettingsView = ({
    appSettings, promoSettings, setPromoSettings,
    isSavingSettings, setIsSavingSettings,
    isSavingRegistrationFees, setIsSavingRegistrationFees,
    isSavingSubscription, setIsSavingSubscription,
    isUpdatingBanner,
    fetchAppSettings, savePromoSettings,
}: Props) => (
    <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#007F00]" />
                Platform Config
            </h3>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    try {
                        setIsSavingSettings(true);
                        const { error } = await supabase.from('app_settings').update({
                            default_quote_price: parseFloat(formData.get('default_quote_price') as string),
                            vat_rate: parseFloat(formData.get('vat_rate') as string),
                            company_name: formData.get('company_name') as string,
                            support_email: formData.get('support_email') as string,
                        }).eq('id', appSettings?.id);
                        if (error) throw error;
                        toast.success('Platform settings updated!');
                        fetchAppSettings();
                    } catch (err: any) {
                        toast.error(err.message);
                    } finally {
                        setIsSavingSettings(false);
                    }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                    <input name="company_name" defaultValue={appSettings?.company_name || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Support Email</label>
                    <input name="support_email" defaultValue={appSettings?.support_email || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Default Quote Price (€)</label>
                    <input name="default_quote_price" type="number" step="0.01" defaultValue={appSettings?.default_quote_price} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">VAT Rate (%)</label>
                    <input name="vat_rate" type="number" step="0.1" defaultValue={appSettings?.vat_rate} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSavingSettings}
                        className="bg-[#007F00] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSavingSettings ? <Loader2 className="animate-spin" size={18} /> : null}
                        {isSavingSettings ? 'Saving...' : 'Save Configurations'}
                    </button>
                </div>
            </form>
        </div>

        {/* Business Subscription Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-purple-600" />
                Business Subscription Settings
            </h3>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    try {
                        setIsSavingSubscription(true);
                        const subscriptionAmount = parseFloat(formData.get('business_subscription_amount') as string);
                        const { error } = await supabase.from('app_settings').update({
                            business_subscription_amount: subscriptionAmount,
                        }).eq('id', appSettings?.id);
                        if (error) throw error;
                        toast.success('Business subscription amount updated!');
                        fetchAppSettings();
                    } catch (err: any) {
                        toast.error(err.message);
                    } finally {
                        setIsSavingSubscription(false);
                    }
                }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Monthly Subscription Amount (€)
                        </label>
                        <input 
                            name="business_subscription_amount" 
                            type="number" 
                            step="0.01" 
                            min="0"
                            defaultValue={appSettings?.business_subscription_amount ?? 29.99} 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Set to 0 to make subscriptions FREE for all businesses
                        </p>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 w-full">
                            <p className="text-sm font-bold text-purple-900">
                                Current Status: {appSettings?.business_subscription_amount === 0 ? 'FREE' : `€${appSettings?.business_subscription_amount?.toFixed(2) || '29.99'}/month`}
                            </p>
                            <p className="text-xs text-purple-700 mt-1">
                                {appSettings?.business_subscription_amount === 0 
                                    ? 'All businesses can subscribe without payment' 
                                    : 'Businesses will be charged this amount monthly'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSavingSubscription}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:bg-purple-700"
                    >
                        {isSavingSubscription ? <Loader2 className="animate-spin" size={18} /> : null}
                        {isSavingSubscription ? 'Saving...' : 'Update Subscription Amount'}
                    </button>
                </div>
            </form>
        </div>

        {/* Registration Fees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />
                Membership Registration Fees
            </h3>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    try {
                        setIsSavingRegistrationFees(true);
                        const { error } = await supabase.from('app_settings').update({
                            domestic_assessor_price: parseFloat(formData.get('domestic_assessor_price') as string),
                            commercial_assessor_price: parseFloat(formData.get('commercial_assessor_price') as string),
                            bundle_assessor_price: parseFloat(formData.get('bundle_assessor_price') as string),
                            business_registration_price: parseFloat(formData.get('business_registration_price') as string)
                        }).eq('id', appSettings?.id);
                        if (error) throw error;
                        toast.success('Registration fees updated!');
                        fetchAppSettings();
                    } catch (err: any) {
                        toast.error(err.message);
                    } finally {
                        setIsSavingRegistrationFees(false);
                    }
                }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Domestic Assessor (€)</label>
                        <input name="domestic_assessor_price" type="number" step="1" defaultValue={appSettings?.domestic_assessor_price ?? REGISTRATION_PRICES.DOMESTIC_ASSESSOR} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commercial Assessor (€)</label>
                        <input name="commercial_assessor_price" type="number" step="1" defaultValue={appSettings?.commercial_assessor_price ?? REGISTRATION_PRICES.COMMERCIAL_ASSESSOR} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bundle Assessor (€)</label>
                        <input name="bundle_assessor_price" type="number" step="1" defaultValue={appSettings?.bundle_assessor_price ?? REGISTRATION_PRICES.BUNDLE_ASSESSOR} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Reg (€)</label>
                        <input name="business_registration_price" type="number" step="1" defaultValue={appSettings?.business_registration_price ?? REGISTRATION_PRICES.BUSINESS_REGISTRATION} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSavingRegistrationFees}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:bg-blue-700"
                    >
                        {isSavingRegistrationFees ? <Loader2 className="animate-spin" size={18} /> : null}
                        {isSavingRegistrationFees ? 'Saving...' : 'Update Registration Fees'}
                    </button>
                </div>
            </form>
        </div>

        {/* Promo Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Homepage Promo Banner</h3>
            <form onSubmit={savePromoSettings} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        checked={promoSettings.is_enabled}
                        onChange={(e) => setPromoSettings({ ...promoSettings, is_enabled: e.target.checked })}
                        className="w-5 h-5 text-[#007F00] rounded focus:ring-[#007F00]"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Promo Banner</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                        <input
                            value={promoSettings.headline || ''}
                            onChange={(e) => setPromoSettings({ ...promoSettings, headline: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Sub Text</label>
                        <input
                            value={promoSettings.sub_text || ''}
                            onChange={(e) => setPromoSettings({ ...promoSettings, sub_text: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Destination URL</label>
                        <input
                            value={promoSettings.destination_url || ''}
                            onChange={(e) => setPromoSettings({ ...promoSettings, destination_url: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isUpdatingBanner}
                        className="bg-[#007F00] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isUpdatingBanner ? <Loader2 className="animate-spin" size={18} /> : null}
                        {isUpdatingBanner ? 'Updating...' : 'Update Banner'}
                    </button>
                </div>
            </form>
        </div>

        {/* Change Admin Password */}
        <ChangePasswordSection />
    </div>
);
