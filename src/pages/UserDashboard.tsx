
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LogOut, FileText, User, Calendar, Home, AlertCircle, X, Mail, Menu } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuoteModal from '../components/QuoteModal';
import EmailVerification from '../components/EmailVerification';
import PaymentModal from '../components/PaymentModal';

interface Quote {
    id: string;
    price: number;
    estimated_date: string | null;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    assessment_id: string;
    created_by: string;
    contractor?: {
        full_name: string;
        seai_number: string;
        assessor_type?: string;
        company_name?: string;
        insurance_holder?: boolean;
        vat_registered?: boolean;
    };
    assessment?: any;
}

interface Assessment {
    id: string;
    property_address: string;
    status: 'draft' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed';
    scheduled_date: string | null;
    certificate_url: string | null;
    created_at: string;
    eircode?: string;
    town?: string;
    county?: string;
    property_type?: string;
    quotes?: Quote[];
    preferred_date?: string;
    preferred_time?: string;
    property_size?: string;
    bedrooms?: number;
    heat_pump?: string;
    ber_purpose?: string;
    additional_features?: string[];
}

const UserDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [selectedDetailsQuote, setSelectedDetailsQuote] = useState<Quote | null>(null); // New state for quote details modal
    const [view, setView] = useState<'assessments' | 'quotes'>('assessments');
    const [verifyingQuote, setVerifyingQuote] = useState<{ assessmentId: string, quoteId: string, targetStatus: 'accepted' | 'rejected' } | null>(null);
    const [confirmReject, setConfirmReject] = useState<{ assessmentId: string, quoteId: string } | null>(null);
    const [verificationStep, setVerificationStep] = useState<1 | 2>(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [verifyEircode, setVerifyEircode] = useState('');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentQuote, setPaymentQuote] = useState<{ assessmentId: string, quoteId: string, amount: number } | null>(null);

    useEffect(() => {
        fetchAssessments();

        // Real-time subscription
        if (!user) return;

        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'assessments', filter: `user_id=eq.${user.id}` },
                () => fetchAssessments()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'quotes' },
                () => fetchAssessments()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'assessment_messages' },
                () => fetchAssessments()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchAssessments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('assessments')
                .select(`
                    *,
                    quotes (
                        *,
                        contractor:profiles(
                            full_name,
                            seai_number,
                            assessor_type,
                            company_name,
                            insurance_holder,
                            vat_registered
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAssessments(data || []);
        } catch (error: any) {
            console.error('Error fetching assessments:', error);
            toast.error('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    const handleSubmitAssessment = async (id: string) => {
        try {
            const { error } = await supabase
                .from('assessments')
                .update({ status: 'submitted' })
                .eq('id', id);

            if (error) throw error;
            toast.success('Assessment submitted for review!');
            fetchAssessments();
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit');
        }
    };

    const handleUpdateQuoteStatus = async (assessmentId: string, quoteId: string, newStatus: 'accepted' | 'rejected') => {
        try {
            if (newStatus === 'accepted') {
                // Fetch the quote to get the price
                const { data: quote, error: fetchError } = await supabase
                    .from('quotes')
                    .select('price')
                    .eq('id', quoteId)
                    .single();

                if (fetchError) throw fetchError;

                // Open Payment Modal instead of immediate update
                setPaymentQuote({ assessmentId, quoteId, amount: quote.price + 10 }); // Including platform fee
                setPaymentModalOpen(true);
                return;
            } else {
                const { error: quoteError } = await supabase
                    .from('quotes')
                    .update({ status: newStatus })
                    .eq('id', quoteId);

                if (quoteError) throw quoteError;
                toast.success('Quote rejected');
            }
            fetchAssessments();
        } catch (error: any) {
            toast.error(error.message || 'Action failed');
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!paymentQuote) return;

        try {
            // 1. Record Payment in DB
            const { error: paymentError } = await supabase.from('payments').insert({
                amount: paymentQuote.amount,
                currency: 'eur',
                status: 'completed',
                assessment_id: paymentQuote.assessmentId,
                user_id: user?.id,
                stripe_payment_id: paymentIntentId
            });

            if (paymentError) {
                console.error('Payment recorded failed but stripe succeeded:', paymentError);
                toast.error('Payment recorded with errors. Please contact support.');
            }

            // 2. Finalize Quote Acceptance
            // Fetch the quote to get the contractor_id
            const { data: quote, error: fetchError } = await supabase
                .from('quotes')
                .select('created_by')
                .eq('id', paymentQuote.quoteId)
                .single();

            if (fetchError) throw fetchError;

            const { error: quoteError } = await supabase
                .from('quotes')
                .update({ status: 'accepted' })
                .eq('id', paymentQuote.quoteId);

            if (quoteError) throw quoteError;

            const { error: assessmentError } = await supabase
                .from('assessments')
                .update({
                    status: 'quote_accepted',
                    contractor_id: quote.created_by,
                    payment_status: 'paid'
                })
                .eq('id', paymentQuote.assessmentId);

            if (assessmentError) throw assessmentError;

            // Notify homeowner and contractor about the acceptance
            supabase.functions.invoke('send-acceptance-notification', {
                body: { assessmentId: paymentQuote.assessmentId, quoteId: paymentQuote.quoteId }
            }).catch(err => console.error('Failed to trigger acceptance notification:', err));

            toast.success('Payment successful! Quote accepted.');
            setPaymentModalOpen(false);
            setPaymentQuote(null);
            fetchAssessments();

        } catch (error: any) {
            console.error('Error finalizing acceptance:', error);
            toast.error('Payment succeeded but update failed. Contact support.');
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'scheduled': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'quote_accepted': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'pending_quote': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'draft': return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans">
            <header className="bg-[#0c121d] backdrop-blur-md border-b border-white/5 sticky top-0 z-[9999] shadow-lg transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="relative flex-shrink-0">
                            <img src="/logo.svg" alt="The Berman Logo" className="h-10 w-auto relative z-10" />
                        </Link>
                        <div className="hidden xl:block">
                            <h1 className="text-lg font-bold text-white leading-tight">My Dashboard</h1>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1.5 uppercase tracking-widest font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                Active Account Status
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="bg-white/5 p-2.5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-2 text-white/70"
                            >
                                {isMenuOpen ? <X size={20} className="text-[#5CB85C]" /> : <Menu size={20} className="text-[#5CB85C]" />}
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] hidden sm:block">Menu</span>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="p-2 space-y-1 border-b border-gray-50 bg-gray-50/30">
                                        <div className="px-4 py-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {[
                                            { id: 'assessments', label: 'My Assessments', icon: Home },
                                            { id: 'quotes', label: 'My Quotes', icon: FileText },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => { setView(item.id as any); setIsMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-200 ${view === item.id ? 'bg-[#5CB85C]/10 text-[#5CB85C]' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={16} />
                                                    {item.label}
                                                </div>
                                                {view === item.id && <div className="w-1.5 h-1.5 rounded-full bg-[#5CB85C]"></div>}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-2 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-1">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] text-red-500 hover:bg-red-50 flex items-center justify-between"
                                        >
                                            Sign Out
                                            <LogOut size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#007F00] rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading your assessments...</p>
                    </div>
                ) : assessments.length === 0 ? (
                    /* Empty State Dashboard */
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-10 md:p-16 text-center">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#007F00]">
                                <User size={48} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back!</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                                This is your personal dashboard. Tracking of your BER assessments will appear here soon.
                            </p>

                            <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-8 text-left flex flex-col md:flex-row gap-6 items-center">
                                <div className="bg-white p-4 rounded-xl shadow-sm text-[#007F00] border border-gray-50">
                                    <FileText size={32} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">No Active Assessments</h4>
                                    <p className="text-gray-500 leading-relaxed">
                                        You don't have any pending BER assessments. Contact us to schedule one and improve your home's energy efficiency.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsQuoteModalOpen(true)}
                                className="mt-12 inline-flex items-center gap-2 bg-[#007F00] text-white px-8 py-4 rounded-full font-bold hover:bg-[#006600] transition-all shadow-lg shadow-green-100 hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Schedule a BER Assessment
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Populated Dashboard */
                    <div className="w-full mx-auto">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                            <div className="px-8 py-10 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black text-gray-900 mb-2">
                                            {view === 'assessments' ? 'My BER Assessments' : 'Received Quotes'}
                                        </h2>
                                        <p className="text-gray-500 font-medium max-w-2xl">
                                            {view === 'assessments' ? 'Track the progress of your property certification and view scheduled assessments.' : 'Review and manage quotes from our verified professional BER Assessors.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsQuoteModalOpen(true)}
                                        className="bg-[#007F00] text-white px-8 py-4 rounded-full font-bold hover:bg-[#006600] transition-all shadow-lg shadow-green-100 hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                                    >
                                        <Home size={20} />
                                        New Assessment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {view === 'assessments' ? (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Desktop Table View */}
                                <div className="overflow-x-auto hidden md:block">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Posted</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Town</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">County</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Type</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Sq. Mt.</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Beds</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Heat Pump</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Purpose</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Addition</th>
                                                <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Preferred Date</th>
                                                <th className="text-right py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assessments.map((assessment, index) => (
                                                <tr
                                                    key={assessment.id}
                                                    className={`border-b border-gray-50 hover:bg-green-50/20 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'}`}
                                                >
                                                    <td className="py-4 px-6">
                                                        <div className="text-xs font-bold text-gray-400 whitespace-nowrap">
                                                            {new Date(assessment.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {assessment.town}
                                                            {assessment.quotes && assessment.quotes.some(q => q.status === 'pending') && (
                                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" title="New Quote"></span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600 font-medium whitespace-nowrap">
                                                        {assessment.county}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-400 font-bold text-xs uppercase tracking-tight whitespace-nowrap">
                                                        {assessment.property_type}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                        {assessment.property_size}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                        {assessment.bedrooms}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                        {assessment.heat_pump}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600 whitespace-nowrap">
                                                            {assessment.ber_purpose || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-500 text-xs max-w-[150px] truncate" title={assessment.additional_features?.join(', ')}>
                                                        {assessment.additional_features?.join(', ') || 'None'}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                        {assessment.preferred_date || 'Flexible'}
                                                    </td>
                                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                                        {assessment.status === 'draft' ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => setSelectedAssessment(assessment)}
                                                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSubmitAssessment(assessment.id)}
                                                                    className="px-3 py-1.5 bg-[#007F00] text-white rounded-lg text-xs font-bold hover:bg-[#006600] transition-all"
                                                                >
                                                                    Submit
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSelectedAssessment(assessment)}
                                                                className="px-4 py-2 border border-green-100 text-[#007F00] bg-green-50/50 rounded-xl text-xs font-black hover:bg-[#007F00] hover:text-white transition-all"
                                                            >
                                                                {assessment.status === 'completed' ? 'View Results' : 'View Details'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-gray-100">
                                    {assessments.map((assessment) => (
                                        <div key={assessment.id} className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                                        {new Date(assessment.created_at).toLocaleDateString()}
                                                    </p>
                                                    <h4 className="font-bold text-gray-900">{assessment.property_address}</h4>
                                                    <p className="text-xs text-gray-500">{assessment.town}, {assessment.county}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(assessment.status)}`}>
                                                    {assessment.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                    {assessment.property_type}
                                                </div>
                                                {assessment.quotes && assessment.quotes.some(q => q.status === 'pending') && (
                                                    <div className="text-[10px] font-black text-[#007F00] flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                        NEW QUOTES
                                                    </div>
                                                )}
                                            </div>

                                            {assessment.status === 'draft' ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => setSelectedAssessment(assessment)}
                                                        className="w-full py-3 border border-gray-100 text-gray-600 rounded-xl font-black text-xs hover:bg-gray-50 transition-all"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleSubmitAssessment(assessment.id)}
                                                        className="w-full py-3 bg-[#007F00] text-white rounded-xl font-black text-xs hover:bg-[#006600] transition-all"
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedAssessment(assessment)}
                                                    className="w-full py-3 bg-[#007F00] text-white rounded-xl font-black text-xs hover:bg-[#006600] transition-all shadow-md shadow-green-100"
                                                >
                                                    {assessment.status === 'completed' ? 'View Certificate' : 'View Details'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a })))
                                    .length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <FileText size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No quotes received yet</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">Once BER Assessors review your submitted assessments, their quotes will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                        {/* Desktop Table View */}
                                        <div className="overflow-x-auto hidden md:block">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Property</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Quote</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Earliest Availability</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Assessor ID</th>
                                                        <th className="text-right py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a })))
                                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                        .map((quote, index) => (
                                                            <tr
                                                                key={quote.id}
                                                                className={`border-b border-gray-50 hover:bg-green-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}
                                                            >
                                                                <td className="py-4 px-6">
                                                                    <div className="font-bold text-gray-900 line-clamp-1">{quote.assessment.property_address}</div>
                                                                    <div className="text-[10px] text-gray-500 font-medium">{quote.assessment.town}</div>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <div className="text-lg font-black text-gray-900">€{quote.price + 10}</div>
                                                                </td>
                                                                <td className="py-4 px-6 text-gray-600 font-medium whitespace-nowrap">
                                                                    {quote.estimated_date ? new Date(quote.estimated_date).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBC'}
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    {quote.contractor ? (
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-gray-700">#{quote.contractor.seai_number || quote.created_by.slice(0, 6)}</span>
                                                                            <Link
                                                                                to={`/profiles/${quote.created_by}`}
                                                                                className="text-[10px] text-green-500 hover:text-green-600 font-bold hover:underline"
                                                                            >
                                                                                View Profile
                                                                            </Link>
                                                                        </div>
                                                                    ) : <span className="text-gray-400">-</span>}
                                                                </td>
                                                                <td className="py-4 px-6 text-right">
                                                                    {quote.status === 'pending' ? (
                                                                        <div className="flex justify-end gap-3">
                                                                            <button
                                                                                onClick={() => setConfirmReject({ assessmentId: quote.assessment_id || quote.assessment.id, quoteId: quote.id })}
                                                                                className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                                title="Reject Quote"
                                                                            >
                                                                                <X size={18} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    // Show details modal first
                                                                                    setSelectedDetailsQuote(quote);
                                                                                }}
                                                                                className="px-6 py-2.5 bg-[#007F00] text-white rounded-lg font-black text-xs hover:bg-[#006600] transition-all shadow-sm active:scale-95 leading-tight text-center"
                                                                            >
                                                                                Accept<br />Quote
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-end">
                                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${quote.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                                                {quote.status}
                                                                            </span>
                                                                            <span className="mt-1 text-[9px] font-bold text-gray-400 italic">
                                                                                {new Date(quote.created_at).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden divide-y divide-gray-100">
                                            {assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a })))
                                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                .map((quote) => (
                                                    <div key={quote.id} className="p-5">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{new Date(quote.created_at).toLocaleDateString()}</p>
                                                                <h4 className="font-bold text-gray-900">{quote.assessment.town}</h4>
                                                                <p className="text-xs text-gray-500 font-medium italic">
                                                                    Earliest: {quote.estimated_date ? new Date(quote.estimated_date).toLocaleDateString() : 'TBC'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-black text-gray-900">€{quote.price + 10}</p>
                                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${quote.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                    quote.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                                    }`}>
                                                                    {quote.status}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {quote.contractor && (
                                                            <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-[#007F00] font-black text-xs shadow-sm border border-gray-100">
                                                                    {quote.contractor.full_name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-gray-900">{quote.contractor.full_name}</p>
                                                                    <p className="text-[9px] text-gray-400">SEAI: {quote.contractor.seai_number || 'Pending'}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {quote.status === 'pending' ? (
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button
                                                                    onClick={() => setConfirmReject({ assessmentId: quote.assessment_id || quote.assessment.id, quoteId: quote.id })}
                                                                    className="w-full py-3 border border-red-100 text-red-600 rounded-xl font-black text-xs hover:bg-red-50 transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDetailsQuote(quote);
                                                                    }}
                                                                    className="w-full py-3 bg-[#80FF80] text-white rounded-xl font-black text-xs hover:bg-[#66E666] transition-all shadow-md shadow-green-100"
                                                                >
                                                                    Accept Quote
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-2 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-400">
                                                                Processed on {new Date(quote.created_at).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Assessment Details Modal */}
            {selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Assessment Details</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedAssessment.property_address}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAssessment(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8 grow">
                            {/* Property Info Section */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <h4 className="flex items-center gap-2 text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                                    <Home size={16} />
                                    Property Information
                                </h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Type</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedAssessment.property_type || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Town</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedAssessment.town || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">County</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedAssessment.county || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Eircode</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedAssessment.eircode || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quotes Section */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
                                    <FileText size={18} className="text-[#007F00]" />
                                    Quotes
                                </h4>
                                {selectedAssessment.quotes && selectedAssessment.quotes.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedAssessment.quotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(quote => (
                                            <div key={quote.id} className="bg-green-50/50 border border-green-100 rounded-2xl p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-2xl font-bold text-gray-900">€{quote.price + 10}</p>
                                                        <p className="text-xs text-gray-400 mt-1">Received {new Date(quote.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${quote.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        quote.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            'bg-white text-[#007F00] border-green-200'
                                                        }`}>
                                                        {quote.status || 'Pending'} Quote
                                                    </div>
                                                </div>
                                                {quote.estimated_date && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                        <Calendar size={14} />
                                                        <span>Proposed Date: <strong>{new Date(quote.estimated_date).toLocaleDateString()}</strong></span>
                                                    </div>
                                                )}
                                                {quote.notes && (
                                                    <div className="text-sm text-gray-600 italic bg-white/50 p-3 rounded-xl mb-4">
                                                        "{quote.notes}"
                                                    </div>
                                                )}

                                                {selectedAssessment.status === 'pending_quote' && quote.status === 'pending' && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => setConfirmReject({ assessmentId: selectedAssessment.id, quoteId: quote.id })}
                                                            className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setVerifyingQuote({ assessmentId: selectedAssessment.id, quoteId: quote.id, targetStatus: 'accepted' });
                                                                setVerificationStep(1);
                                                                setVerifyEircode('');
                                                            }}
                                                            className="flex-1 py-2 rounded-xl bg-[#007F00] text-white text-xs font-bold hover:bg-[#006600] transition-all shadow-sm"
                                                        >
                                                            Accept Quote
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">
                                        No quotes have been generated for this assessment yet.
                                    </p>
                                )}
                            </div>

                            {/* Communication Section */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Mail size={16} className="text-blue-600" />
                                    </div>
                                    <h4 className="text-sm font-bold text-blue-900">Communication Status</h4>
                                </div>
                                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                    All official communication, updates, and chat for this assessment are currently handled via your registered email: <span className="text-blue-900 font-bold">{user?.email}</span>.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                            {selectedAssessment.status === 'completed' && selectedAssessment.certificate_url ? (
                                <a
                                    href={selectedAssessment.certificate_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-[#007F00] text-white py-4 rounded-xl font-bold hover:bg-[#006600] transition-colors shadow-md"
                                >
                                    <FileText size={20} />
                                    Download BER Certificate
                                </a>
                            ) : (
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="w-full bg-[#007F00] text-white py-3 rounded-xl font-bold hover:bg-[#006600] transition-colors shadow-md flex items-center justify-center gap-2"
                                >
                                    <Mail size={18} />
                                    Contact Support via Email
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Questionnaire Modal */}
            <QuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => {
                    setIsQuoteModalOpen(false);
                    fetchAssessments();
                }}
            />

            {/* Payment Modal */}
            {paymentModalOpen && paymentQuote && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    amount={paymentQuote.amount}
                    onSuccess={handlePaymentSuccess}
                    metadata={{
                        assessmentId: paymentQuote.assessmentId,
                        quoteId: paymentQuote.quoteId,
                        userId: user?.id
                    }}
                    title="Complete Assessment Booking"
                    description={`Total includes quote price + €10 booking fee.`}
                />
            )}

            {/* Quote Verification Modal */}
            {verifyingQuote && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full ${verificationStep === 2 ? 'max-w-3xl' : 'max-w-sm'} overflow-hidden animate-in zoom-in-95 duration-200 transition-all duration-500`}>
                        {verificationStep === 1 ? (
                            <div className="p-10 text-center">
                                <div className="mb-8">
                                    <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Your Eircode</h3>
                                    <p className="text-gray-500 font-medium">Last Question...</p>
                                </div>
                                <p className="text-gray-600 mb-8 text-lg">Provide your eircode (without any spaces)</p>
                                <div className="space-y-6">
                                    <input
                                        type="text"
                                        value={verifyEircode}
                                        onChange={(e) => setVerifyEircode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                        placeholder="Enter your Eircode"
                                        className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 text-center text-xl font-bold focus:outline-none focus:border-[#007F00] transition-colors placeholder:text-gray-300"
                                    />
                                    <button
                                        onClick={() => {
                                            if (verifyEircode.length < 7) {
                                                toast.error('Please enter a valid Eircode');
                                                return;
                                            }

                                            // Validate Eircode against the assessment record
                                            const assessment = assessments.find(a => a.id === verifyingQuote.assessmentId);
                                            if (assessment) {
                                                const storedEircode = assessment.eircode?.toUpperCase().replace(/\s/g, '') || '';
                                                const inputEircode = verifyEircode.toUpperCase().replace(/\s/g, '');

                                                if (inputEircode !== storedEircode) {
                                                    toast.error('Incorrect Eircode for this property. Please check and try again.', {
                                                        icon: '❌',
                                                        style: {
                                                            borderRadius: '10px',
                                                            background: '#333',
                                                            color: '#fff',
                                                        },
                                                    });
                                                    return;
                                                }
                                            }

                                            setVerificationStep(2);
                                        }}
                                        className={`w-full ${verifyingQuote.targetStatus === 'accepted' ? 'bg-[#007F00] hover:bg-[#006600]' : 'bg-red-600 hover:bg-red-700'} text-white py-4 rounded-2xl font-bold text-lg transition-all`}
                                    >
                                        {verifyingQuote.targetStatus === 'accepted' ? 'Submit' : 'Continue to Reject'}
                                    </button>
                                    <button
                                        onClick={() => setVerifyingQuote(null)}
                                        className="text-gray-400 font-bold hover:text-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-0 md:p-10 max-h-[90vh] overflow-y-auto">
                                <EmailVerification
                                    email={user?.email || ''}
                                    assessmentId={verifyingQuote.assessmentId}
                                    onVerified={() => {
                                        handleUpdateQuoteStatus(verifyingQuote.assessmentId, verifyingQuote.quoteId, verifyingQuote.targetStatus);
                                        setVerifyingQuote(null);
                                    }}
                                    onBack={() => setVerificationStep(1)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {confirmReject && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <AlertCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Reject Quote?</h3>
                            <p className="text-gray-500 font-medium mb-8">This action cannot be undone. You will need to wait for other BER Assessors to provide new quotes.</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setVerifyingQuote({
                                            assessmentId: confirmReject.assessmentId,
                                            quoteId: confirmReject.quoteId,
                                            targetStatus: 'rejected'
                                        });
                                        setVerificationStep(1);
                                        setVerifyEircode('');
                                        setConfirmReject(null);
                                    }}
                                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                >
                                    Yes, Proceed to Verify
                                </button>
                                <button
                                    onClick={() => setConfirmReject(null)}
                                    className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Details & Final Confirmation Modal */}
            {selectedDetailsQuote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200 border border-gray-100">
                        {/* Header */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-[#80FF80] mb-1">
                                BER Assessor #{selectedDetailsQuote.contractor?.seai_number || selectedDetailsQuote.created_by.slice(0, 6)}
                            </h3>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-500 font-medium text-sm">Quote</span>
                                <span className="text-gray-900 font-black text-lg">€{selectedDetailsQuote.price}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium text-sm">Earliest Availability</span>
                                <span className="text-gray-900 font-black text-sm">
                                    {selectedDetailsQuote.estimated_date
                                        ? new Date(selectedDetailsQuote.estimated_date).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })
                                        : 'TBC'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium text-sm">SEAI Registered</span>
                                <span className="text-gray-900 font-black text-sm">Yes</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium text-sm">VAT Registered</span>
                                <span className="text-gray-900 font-black text-sm">{selectedDetailsQuote.contractor?.vat_registered ? 'Yes' : 'No'}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium text-sm">Professional Insurance</span>
                                <span className="text-gray-900 font-black text-sm">{selectedDetailsQuote.contractor?.insurance_holder ? 'Yes' : 'No'}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-10">
                            <button
                                onClick={() => setSelectedDetailsQuote(null)}
                                className="flex-1 py-3 bg-[#B0BEC5] text-white rounded-lg font-black text-sm hover:bg-[#90A4AE] transition-all shadow-sm active:scale-95"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const quote = selectedDetailsQuote;
                                    setVerifyingQuote({ assessmentId: quote.assessment_id || (quote.assessment && quote.assessment.id), quoteId: quote.id, targetStatus: 'accepted' });
                                    setVerificationStep(1);
                                    setVerifyEircode('');
                                    setSelectedDetailsQuote(null);
                                }}
                                className="flex-[1.5] py-3 bg-[#007F00] text-white rounded-lg font-black text-sm hover:bg-[#006600]  transition-all shadow-sm active:scale-95"
                            >
                                Accept €{selectedDetailsQuote.price} Quote
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
