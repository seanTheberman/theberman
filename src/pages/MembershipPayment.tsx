import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Crown, Zap, Building2 } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { REGISTRATION_PRICES, VAT_RATE } from '../constants/pricing';
import SEOHead from '../components/SEOHead';

const MembershipPayment = () => {
    const navigate = useNavigate();
    const { refreshProfile } = useAuth();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
    const [registrationType, setRegistrationType] = useState<'assessor' | 'business' | null>(null);
    const [priceData, setPriceData] = useState<{ subtotal: number, vat: number, total: number } | null>(null);

    useEffect(() => {
        const fetchSettingsAndCalculate = async () => {
            try {
                // Fetch settings from DB
                const { data: settings, error } = await supabase
                    .from('app_settings')
                    .select('*')
                    .single();

                if (error) throw error;

                const assessorData = sessionStorage.getItem('pending_assessor_registration');
                const businessData = sessionStorage.getItem('pending_business_registration');

                if (assessorData) {
                    setRegistrationType('assessor');
                    const data = JSON.parse(assessorData);
                    const types = data.assessorTypes || [];

                    let subtotal = settings.domestic_assessor_price || REGISTRATION_PRICES.DOMESTIC_ASSESSOR;
                    if (types.includes('Domestic Assessor') && types.includes('Commercial Assessor')) {
                        subtotal = settings.bundle_assessor_price || REGISTRATION_PRICES.BUNDLE_ASSESSOR;
                    }

                    const vat = subtotal * (settings.vat_rate / 100);
                    setPriceData({ subtotal, vat, total: subtotal + vat });
                } else if (businessData) {
                    setRegistrationType('business');
                    const subtotal = settings.business_registration_price || REGISTRATION_PRICES.BUSINESS_REGISTRATION;
                    const vat = subtotal * (settings.vat_rate / 100);
                    setPriceData({ subtotal, vat, total: subtotal + vat });
                } else {
                    toast.error('Registration data not found. Please restart registration.');
                    navigate('/signup');
                }
            } catch (error) {
                console.error('Error fetching prices:', error);
                // Fallback to constants if DB fetch fails
                const assessorData = sessionStorage.getItem('pending_assessor_registration');
                const businessData = sessionStorage.getItem('pending_business_registration');

                if (assessorData) {
                    setRegistrationType('assessor');
                    const data = JSON.parse(assessorData);
                    const types = data.assessorTypes || [];
                    const subtotal = (types.includes('Domestic Assessor') && types.includes('Commercial Assessor'))
                        ? REGISTRATION_PRICES.BUNDLE_ASSESSOR
                        : REGISTRATION_PRICES.DOMESTIC_ASSESSOR;

                    const vat = subtotal * VAT_RATE;
                    setPriceData({ subtotal, vat, total: subtotal + vat });
                } else if (businessData) {
                    setRegistrationType('business');
                    const subtotal = REGISTRATION_PRICES.BUSINESS_REGISTRATION;
                    const vat = subtotal * VAT_RATE;
                    setPriceData({ subtotal, vat, total: subtotal + vat });
                }
            }
        };

        fetchSettingsAndCalculate();
    }, [navigate]);

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        setFinalizing(true);
        try {
            if (registrationType === 'assessor') {
                const pendingData = sessionStorage.getItem('pending_assessor_registration');
                if (!pendingData) throw new Error('Registration data missing');

                const registrationData = JSON.parse(pendingData);
                const { error } = await supabase.functions.invoke('confirm-assessor-registration', {
                    body: { registrationData, paymentIntentId }
                });
                if (error) throw error;

                await refreshProfile();
                toast.success('Assessor registration finalized!');
                sessionStorage.removeItem('pending_assessor_registration');
                setTimeout(() => navigate('/dashboard/ber-assessor'), 2000);

            } else if (registrationType === 'business') {
                const pendingData = sessionStorage.getItem('pending_business_registration');
                if (!pendingData) throw new Error('Registration data missing');

                const registrationData = JSON.parse(pendingData);
                const { error } = await supabase.functions.invoke('confirm-business-registration', {
                    body: { registrationData, paymentIntentId }
                });
                if (error) throw error;

                await refreshProfile();
                toast.success('Business registration finalized!');
                sessionStorage.removeItem('pending_business_registration');
                setTimeout(() => navigate('/dashboard/business'), 2000);
            }

        } catch (error: any) {
            console.error('Finalization Error:', error);
            toast.error('Failed to finalize registration. Please contact support.');
        } finally {
            setFinalizing(false);
            setIsPaymentModalOpen(false);
        }
    };

    if (!registrationType || !priceData) return null;

    return (
        <div className="font-sans text-gray-900 bg-white h-screen flex flex-col justify-center items-center px-4">
            <SEOHead
                title="Membership Payment"
                description="Complete your membership payment for The Berman platform."
                noindex={true}
            />

            <div className="w-full max-w-3xl">
                {/* HEADER */}
                <div className="text-center mb-5">
                    <h1 className="text-2xl md:text-4xl font-black text-[#007F00] mb-2 leading-tight uppercase tracking-tight">
                        Membership Fee
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 font-medium">
                        {registrationType === 'assessor'
                            ? "Get more BER jobs with Ireland's largest BER platform."
                            : "Unlock premium features and get discovered by thousands of homeowners."}
                    </p>
                </div>

                {/* MEMBERSHIP CARD */}
                <div className="bg-white border-2 border-green-100 rounded-2xl p-5 md:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                    <h2 className="text-base md:text-lg font-black text-[#007F00] mb-4 uppercase tracking-widest flex items-center gap-2">
                        {registrationType === 'assessor' ? <Crown className="text-[#007F00]" size={20} /> : <Building2 className="text-[#007F00]" size={20} />}
                        {registrationType === 'assessor' ? 'Assessor Benefits' : 'Business Benefits'}
                    </h2>

                    <div className="space-y-2.5">
                        {registrationType === 'assessor' ? (
                            <>
                                <BenefitItem text="Premium listing as a BER Assessor" />
                                <BenefitItem text="Unlimited Quotes & Job Notifications" />
                                <BenefitItem text="Verified Assessor Badge" />
                                <BenefitItem text="Direct Quote Request Form" />
                            </>
                        ) : (
                            <>
                                <BenefitItem text="Premium listing in Home Energy Catalogue" />
                                <BenefitItem text="Get direct leads from homeowners" />
                                <BenefitItem text="Verified Business Badge" />
                                <BenefitItem text="Comprehensive Business Profile Page" />
                            </>
                        )}

                        <BenefitItem
                            text="Zero risk. 100% Satisfaction Guarantee."
                            isHighlight
                        />
                    </div>

                    {/* CTA / PRICING AREA */}
                    <div className="mt-5 pt-4 border-t border-green-50 text-center">
                        <p className="text-gray-500 text-xs mb-3 max-w-lg mx-auto">
                            To finalize your {registrationType} registration, please complete payment below.
                        </p>

                        <div className="mb-4">
                            <p className="text-2xl md:text-3xl font-black text-gray-900">
                                Total: <span className="text-[#007F00]">€{priceData.total.toFixed(2)}</span>
                            </p>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                                for 12 months <span className="text-gray-400 font-medium">(€{priceData.subtotal} + VAT)</span>
                            </p>
                        </div>

                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            disabled={finalizing}
                            className="inline-flex items-center justify-center gap-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black px-8 py-3 rounded-2xl transition-all shadow-xl shadow-blue-100 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {finalizing ? 'Finalizing...' : 'Pay Membership Fee'}
                            <Zap size={16} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                amount={priceData.total}
                onSuccess={handlePaymentSuccess}
                title={`${registrationType === 'assessor' ? 'Assessor' : 'Business'} Membership`}
            />
        </div>
    );
};

const BenefitItem = ({ text, isHighlight = false }: { text: string; isHighlight?: boolean }) => (
    <div className={`flex items-start gap-4 ${isHighlight ? 'bg-green-50/50 p-4 rounded-2xl border border-green-100' : ''}`}>
        <CheckCircle2 className="text-[#007F00] mt-0.5 shrink-0" size={22} />
        <span className={`text-base md:text-lg font-bold ${isHighlight ? 'text-[#007F00]' : 'text-gray-800'}`}>
            {text}
        </span>
    </div>
);

export default MembershipPayment;
