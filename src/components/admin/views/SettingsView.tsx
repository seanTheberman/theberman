import { TrendingUp, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { AppSettings } from '../../../types/admin';
import { REGISTRATION_PRICES } from '../../../constants/pricing';
import toast from 'react-hot-toast';

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
    isUpdatingBanner: boolean;
    fetchAppSettings: () => void;
    savePromoSettings: (e: React.FormEvent) => void;
}

export const SettingsView = ({
    appSettings, promoSettings, setPromoSettings,
    isSavingSettings, setIsSavingSettings,
    isSavingRegistrationFees, setIsSavingRegistrationFees,
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
    </div>
);
