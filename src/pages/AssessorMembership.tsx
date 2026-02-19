import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Shield, Star, Crown, Layout, User, Globe, MapPin, Zap } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const AssessorMembership = () => {
    const navigate = useNavigate();
    const { refreshProfile } = useAuth();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        setFinalizing(true);
        try {
            const pendingData = sessionStorage.getItem('pending_assessor_registration');
            if (!pendingData) {
                toast.error('Registration data not found. Please contact support.');
                return;
            }

            const registrationData = JSON.parse(pendingData);

            // Call Edge Function to finalize registration
            const { error } = await supabase.functions.invoke('confirm-assessor-registration', {
                body: { registrationData, paymentIntentId }
            });

            if (error) throw error;

            // Refresh profile to update role and seai_number client-side
            await refreshProfile();

            toast.success('Registration finalized successfully!');
            sessionStorage.removeItem('pending_assessor_registration');

            // Redirect to Assessor Dashboard
            setTimeout(() => {
                navigate('/dashboard/ber-assessor');
            }, 2000);

        } catch (error: any) {
            console.error('Finalization Error:', error);
            toast.error('Failed to finalize registration. Please contact support.');
        } finally {
            setFinalizing(false);
            setIsPaymentModalOpen(false);
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-white h-screen flex flex-col justify-center items-center px-4">
            <title>Assessor Membership | The Berman</title>

            <div className="w-full max-w-3xl">
                {/* HEADER */}
                <div className="text-center mb-5">
                    <h1 className="text-2xl md:text-4xl font-black text-[#007F00] mb-2 leading-tight uppercase tracking-tight">
                        Membership Fee
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 font-medium">
                        Get more BER jobs with Ireland's largest BER platform.
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 max-w-xl mx-auto mt-1">
                        We send thousands of jobs worth millions of euro to our registered assessors, and we'd love you to join us.
                    </p>
                </div>

                {/* MEMBERSHIP CARD */}
                <div className="bg-white border-2 border-green-100 rounded-2xl p-5 md:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                    <h2 className="text-base md:text-lg font-black text-[#007F00] mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Crown className="text-[#007F00]" size={20} />
                        Membership Benefits
                    </h2>

                    <div className="space-y-2.5">
                        <BenefitItem text="Premium listing in our Home Energy Catalogue as a BER Assessor" />
                        <BenefitItem text="Unlimited Quotes" />
                        <BenefitItem text="Instant Job Notifications (Email)" />
                        <BenefitItem text="Same Day Service" />

                        <div className="space-y-2">
                            <BenefitItem text="Personalised BER Assessor Profile Page" />
                            <div className="ml-8 space-y-1.5">
                                <SubBenefitItem icon={<Shield size={12} />} text="'Verified' Assessor Badge" />
                                <SubBenefitItem icon={<Layout size={12} />} text="Direct Quote Request Form" />
                                <SubBenefitItem icon={<User size={12} />} text="Advertise Your Contact Details" />
                                <SubBenefitItem icon={<Star size={12} />} text="Display Your Company Name" />
                                <SubBenefitItem icon={<Globe size={12} />} text="Link to Your Website" />
                                <SubBenefitItem icon={<MapPin size={12} />} text="Unlimited Service Areas" />
                            </div>
                        </div>

                        <BenefitItem
                            text="Zero risk. No jobs? We'll refund your membership fee in full."
                            isHighlight
                        />
                    </div>

                    {/* CTA / PRICING AREA */}
                    <div className="mt-5 pt-4 border-t border-green-50 text-center">
                        <p className="text-gray-500 text-xs mb-3 max-w-lg mx-auto">
                            To finalise your assessor registration, please complete payment of your membership fee below.
                        </p>

                        <div className="mb-4">
                            <p className="text-2xl md:text-3xl font-black text-gray-900">
                                Only <span className="text-[#007F00]">€369</span>
                            </p>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                                for 12 months <span className="text-gray-400 font-medium">(€300 + VAT)</span>
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
                amount={369}
                onSuccess={handlePaymentSuccess}
                title="Assessor Membership"
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

const SubBenefitItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-3 text-gray-600">
        <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
            {icon}
        </div>
        <span className="text-sm font-semibold italic">{text}</span>
    </div>
);

export default AssessorMembership;
