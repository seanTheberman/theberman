
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LogOut, FileText, User, Home, AlertCircle, X, Menu, Trash2, Search, Clock } from 'lucide-react';
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
    is_loyalty_payout?: boolean;
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
    job_type?: string;
    building_type?: string;
    floor_area?: string;
    building_complexity?: string;
    heating_cooling_systems?: string[];
    assessment_purpose?: string;
    existing_docs?: string[];
    notes?: string;
}

const UserDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDetailsQuote, setSelectedDetailsQuote] = useState<Quote | null>(null); // New state for quote details modal
    const [view, setView] = useState<'assessments' | 'quotes'>('assessments');
    const [searchQuery, setSearchQuery] = useState('');
    const [verifyingQuote, setVerifyingQuote] = useState<{ assessmentId: string, quoteId: string, targetStatus: 'accepted' | 'rejected' } | null>(null);
    const [confirmReject, setConfirmReject] = useState<{ assessmentId: string, quoteId: string } | null>(null);
    const [verificationStep, setVerificationStep] = useState<1 | 2>(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [verifyEircode, setVerifyEircode] = useState('');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentQuote, setPaymentQuote] = useState<{ assessmentId: string, quoteId: string, amount: number, balance?: number } | null>(null);
    const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null);

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

            // Filter out jobs older than 5 days that haven't had a quote accepted
            const filteredData = (data || []).filter(assessment => {
                const createdAt = new Date(assessment.created_at);
                const now = new Date();
                const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);

                // Keep if new (< 5 days) OR if it's already progressed beyond pending quotes
                const isExpired = diffInDays > 5 && !['quote_accepted', 'scheduled', 'completed'].includes(assessment.status);
                return !isExpired;
            });

            setAssessments(filteredData);
        } catch (error: any) {
            console.error('Error fetching assessments:', error);
            toast.error('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const getQuoteExpiry = (quoteCreatedAt: string) => {
        const created = new Date(quoteCreatedAt);
        const expiry = new Date(created.getTime() + 5 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return { isExpired: daysLeft <= 0, daysLeft: Math.max(0, daysLeft) };
    };

    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    const handleSubmitAssessment = async (id: string) => {
        try {
            // 1. Fetch assessment details for notification
            const { data: assessment, error: fetchError } = await supabase
                .from('assessments')
                .select('*, profiles(full_name, email)')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // 2. Update status to live
            const { error: updateError } = await supabase
                .from('assessments')
                .update({ status: 'live' })
                .eq('id', id);

            if (updateError) throw updateError;

            // 3. Trigger notification
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: assessment.profiles?.email || assessment.contact_email,
                        customerName: assessment.profiles?.full_name || assessment.contact_name,
                        county: assessment.county,
                        town: assessment.town,
                        assessmentId: id,
                        jobType: assessment.job_type
                    }
                });
            } catch (emailErr) {
                console.error('Failed to send job live email:', emailErr);
            }

            toast.success('Assessment is now live and assessors have been notified!');
            fetchAssessments();
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Failed to submit');
        }
    };

    const handleDeleteAssessment = async (id: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('delete-assessment', {
                body: { assessmentId: id }
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.error || 'Failed to delete job');

            toast.success('Job deleted successfully');
            fetchAssessments();
        } catch (error: any) {
            console.error('Delete assessment error:', error);
            toast.error(error.message || 'Failed to delete job');
        } finally {
            setDeletingAssessmentId(null);
        }
    };

    const handleUpdateQuoteStatus = async (assessmentId: string, quoteId: string, newStatus: 'accepted' | 'rejected') => {
        try {
            if (newStatus === 'accepted') {
                // Fetch the quote to get the price and loyalty status
                const { data: quote, error: fetchError } = await supabase
                    .from('quotes')
                    .select('price, is_loyalty_payout')
                    .eq('id', quoteId)
                    .single();

                if (fetchError) throw fetchError;

                // Open Payment Modal with appropriate deposit (fixed €40 or €10 if loyalty) and calculate balance
                const depositAmount = quote.is_loyalty_payout ? 10 : 40;
                const balance = (quote.price + 10) - depositAmount;
                setPaymentQuote({ assessmentId, quoteId, amount: depositAmount, balance });
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
                                onClick={() => navigate('/get-quote')}
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
                                        onClick={() => navigate('/get-quote')}
                                        className="bg-[#007F00] text-white px-8 py-4 rounded-full font-bold hover:bg-[#006600] transition-all shadow-lg shadow-green-100 hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                                    >
                                        <Home size={20} />
                                        New Assessment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {view === 'assessments' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by town, county, type, or address..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* ===== ALL BER ASSESSMENTS (Merged Table) ===== */}
                                {assessments.filter(a => {
                                    if (!searchQuery.trim()) return true;
                                    const q = searchQuery.toLowerCase();
                                    return (
                                        (a.town?.toLowerCase().includes(q)) ||
                                        (a.county?.toLowerCase().includes(q)) ||
                                        (a.property_type?.toLowerCase().includes(q)) ||
                                        (a.building_type?.toLowerCase().includes(q)) ||
                                        (a.property_address?.toLowerCase().includes(q)) ||
                                        (a.ber_purpose?.toLowerCase().includes(q)) ||
                                        (a.assessment_purpose?.toLowerCase().includes(q)) ||
                                        (a.heat_pump?.toLowerCase().includes(q))
                                    );
                                }).length > 0 && (
                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">All BER Assessments</h3>
                                                <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{assessments.length}</span>
                                            </div>
                                            {/* Desktop Table View */}
                                            <div className="overflow-x-auto overflow-y-auto max-h-[600px] hidden md:block">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-200">
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Posted</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Type</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Town</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">County</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Building Type</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Floor Area</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Details</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Purpose</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Extra Info</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Preferred Date</th>
                                                            <th className="text-right py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {assessments.filter(a => {
                                                            if (!searchQuery.trim()) return true;
                                                            const q = searchQuery.toLowerCase();
                                                            return (
                                                                (a.town?.toLowerCase().includes(q)) ||
                                                                (a.county?.toLowerCase().includes(q)) ||
                                                                (a.property_type?.toLowerCase().includes(q)) ||
                                                                (a.building_type?.toLowerCase().includes(q)) ||
                                                                (a.property_address?.toLowerCase().includes(q)) ||
                                                                (a.ber_purpose?.toLowerCase().includes(q)) ||
                                                                (a.assessment_purpose?.toLowerCase().includes(q)) ||
                                                                (a.heat_pump?.toLowerCase().includes(q))
                                                            );
                                                        }).map((assessment, index) => {
                                                            const isCommercial = assessment.job_type === 'commercial';
                                                            return (
                                                                <tr
                                                                    key={assessment.id}
                                                                    className={`border-b border-gray-50 hover:bg-green-50/20 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'}`}
                                                                >
                                                                    <td className="py-4 px-6">
                                                                        <div className="text-xs font-bold text-gray-400 whitespace-nowrap">
                                                                            {new Date(assessment.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isCommercial ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                                            {isCommercial ? 'Commercial' : 'Domestic'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                                                                        <div className="flex items-center gap-2">
                                                                            {assessment.town}
                                                                            {assessment.quotes && assessment.quotes.some(q => q.status === 'pending') && (
                                                                                <span className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${isCommercial ? 'bg-purple-500 shadow-purple-200' : 'bg-green-500 shadow-green-200'}`} title="New Quote"></span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-600 font-medium whitespace-nowrap">
                                                                        {assessment.county}
                                                                    </td>
                                                                    <td className={`py-4 px-6 font-bold text-xs uppercase tracking-tight whitespace-nowrap ${isCommercial ? 'text-purple-700' : 'text-gray-400'}`}>
                                                                        {isCommercial ? (assessment.building_type || '-') : (assessment.property_type || '-')}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                                        {isCommercial ? (assessment.floor_area || '-') : (assessment.property_size || '-')}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                                        {isCommercial
                                                                            ? (assessment.building_complexity || '-')
                                                                            : (`${assessment.bedrooms || '-'} beds / ${assessment.heat_pump || 'No'} HP`)}
                                                                    </td>
                                                                    <td className="py-4 px-6">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${isCommercial ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                            {isCommercial ? (assessment.assessment_purpose || '-') : (assessment.ber_purpose || '-')}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-500 text-xs max-w-[150px] truncate" title={isCommercial ? assessment.existing_docs?.join(', ') : assessment.additional_features?.join(', ')}>
                                                                        {isCommercial
                                                                            ? (assessment.existing_docs?.join(', ') || '-')
                                                                            : (assessment.additional_features?.join(', ') || 'None')}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                                        {assessment.preferred_date || 'Flexible'}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                                                        <div className="flex justify-end items-center gap-3">
                                                                            {assessment.status === 'draft' ? (
                                                                                <button
                                                                                    onClick={() => handleSubmitAssessment(assessment.id)}
                                                                                    className={`px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-all ${isCommercial ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#007F00] hover:bg-[#006600]'}`}
                                                                                >
                                                                                    Submit
                                                                                </button>
                                                                            ) : assessment.status === 'completed' && assessment.certificate_url ? (
                                                                                <a
                                                                                    href={assessment.certificate_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className={`px-4 py-2 border rounded-xl text-xs font-black transition-all ${isCommercial ? 'border-purple-100 text-purple-600 bg-purple-50/50 hover:bg-purple-600 hover:text-white' : 'border-green-100 text-[#007F00] bg-green-50/50 hover:bg-[#007F00] hover:text-white'}`}
                                                                                >
                                                                                    View Certificate
                                                                                </a>
                                                                            ) : null}
                                                                            {assessment.status !== 'completed' && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setDeletingAssessmentId(assessment.id);
                                                                                    }}
                                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                                    title="Delete Assessment"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Card View - All Assessments */}
                                            <div className="md:hidden divide-y divide-gray-100">
                                                {assessments.filter(a => {
                                                    if (!searchQuery.trim()) return true;
                                                    const q = searchQuery.toLowerCase();
                                                    return (
                                                        (a.town?.toLowerCase().includes(q)) ||
                                                        (a.county?.toLowerCase().includes(q)) ||
                                                        (a.property_type?.toLowerCase().includes(q)) ||
                                                        (a.building_type?.toLowerCase().includes(q)) ||
                                                        (a.property_address?.toLowerCase().includes(q)) ||
                                                        (a.ber_purpose?.toLowerCase().includes(q)) ||
                                                        (a.assessment_purpose?.toLowerCase().includes(q)) ||
                                                        (a.heat_pump?.toLowerCase().includes(q))
                                                    );
                                                }).map((assessment) => {
                                                    const isCommercial = assessment.job_type === 'commercial';
                                                    return (
                                                        <div key={assessment.id} className="p-5">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                            {new Date(assessment.created_at).toLocaleDateString()}
                                                                        </p>
                                                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${isCommercial ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                                            {isCommercial ? 'Commercial' : 'Domestic'}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="font-bold text-gray-900">{assessment.property_address}</h4>
                                                                    <p className="text-xs text-gray-500">{assessment.town}, {assessment.county}</p>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(assessment.status)}`}>
                                                                    {assessment.status.replace('_', ' ')}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className={`text-xs font-bold px-2 py-1 rounded ${isCommercial ? 'text-purple-700 bg-purple-50' : 'text-gray-600 bg-gray-50'}`}>
                                                                    {isCommercial ? (assessment.building_type || '-') : (assessment.property_type || '-')}
                                                                </div>
                                                                {assessment.quotes && assessment.quotes.some(q => q.status === 'pending') && (
                                                                    <div className={`text-[10px] font-black flex items-center gap-1 ${isCommercial ? 'text-purple-600' : 'text-[#007F00]'}`}>
                                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCommercial ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                                                        NEW QUOTES
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {assessment.status === 'draft' ? (
                                                                <button
                                                                    onClick={() => handleSubmitAssessment(assessment.id)}
                                                                    className={`w-full py-3 text-white rounded-xl font-black text-xs transition-all mb-3 ${isCommercial ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#007F00] hover:bg-[#006600]'}`}
                                                                >
                                                                    Submit
                                                                </button>
                                                            ) : assessment.status === 'completed' && assessment.certificate_url ? (
                                                                <a
                                                                    href={assessment.certificate_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`w-full py-3 text-white rounded-xl font-black text-xs transition-all shadow-md mb-3 block text-center ${isCommercial ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-100' : 'bg-[#007F00] hover:bg-[#006600] shadow-green-100'}`}
                                                                >
                                                                    View Certificate
                                                                </a>
                                                            ) : null}

                                                            {assessment.status !== 'completed' && (
                                                                <button
                                                                    onClick={() => setDeletingAssessmentId(assessment.id)}
                                                                    className="w-full py-3 border border-red-50 text-red-400 rounded-xl font-black text-xs hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete Assessment
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
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
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Expires</th>
                                                        <th className="text-right py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a })))
                                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                        .map((quote, index) => {
                                                            const { isExpired, daysLeft } = getQuoteExpiry(quote.created_at);
                                                            return (
                                                                <tr
                                                                    key={quote.id}
                                                                    className={`border-b border-gray-50 hover:bg-green-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}
                                                                >
                                                                    <td className="py-4 px-6">
                                                                        <div className="font-bold text-gray-900 line-clamp-1">{quote.assessment.property_address}</div>
                                                                        <div className="text-[10px] text-gray-500 font-medium">{quote.assessment.town}</div>
                                                                    </td>
                                                                    <td className="py-4 px-6">
                                                                        <div className="flex flex-col">
                                                                            <div className="text-lg font-black text-gray-900">€{quote.price + 10}</div>
                                                                            <div className="text-[10px] text-gray-500 font-medium">
                                                                                Deposit: €{quote.is_loyalty_payout ? '10' : '40'} | Balance: €{quote.price + 10 - (quote.is_loyalty_payout ? 10 : 40)}
                                                                            </div>
                                                                        </div>
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
                                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                                        {quote.status === 'pending' && !isExpired ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Clock size={14} className={daysLeft <= 1 ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-green-500'} />
                                                                                <span className={`text-xs font-bold ${daysLeft <= 1 ? 'text-red-600' : daysLeft <= 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                                                                                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                                                                </span>
                                                                            </div>
                                                                        ) : quote.status === 'pending' && isExpired ? (
                                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">Expired</span>
                                                                        ) : (
                                                                            <span className="text-xs text-gray-400">—</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-right">
                                                                        {quote.status === 'pending' ? (
                                                                            isExpired ? (
                                                                                <div className="flex flex-col items-end">
                                                                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100">
                                                                                        Expired
                                                                                    </span>
                                                                                    <span className="mt-1 text-[9px] font-bold text-gray-400 italic">
                                                                                        5-day window elapsed
                                                                                    </span>
                                                                                </div>
                                                                            ) : (quote.assessment.quotes && quote.assessment.quotes.some(q => q.status === 'accepted')) ? (
                                                                                <div className="flex flex-col items-end">
                                                                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                                                                                        Quote Closed
                                                                                    </span>
                                                                                    <span className="mt-1 text-[9px] font-bold text-gray-500 italic">
                                                                                        Job Awarded
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
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
                                                                            )
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
                                                            );
                                                        })}
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
                                                                <div className="text-[9px] text-gray-500 font-medium mt-0.5">
                                                                    Deposit: €40 / Balance: €{quote.price + 10 - 40}
                                                                </div>
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

                                                        {(() => {
                                                            const { isExpired, daysLeft } = getQuoteExpiry(quote.created_at);
                                                            if (quote.status === 'pending') {
                                                                if (isExpired) {
                                                                    return (
                                                                        <div className="text-center py-3 bg-red-50 rounded-xl border border-red-100">
                                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Quote Expired</span>
                                                                            <p className="text-[9px] text-red-400 mt-0.5">5-day acceptance window has elapsed</p>
                                                                        </div>
                                                                    );
                                                                }
                                                                if (quote.assessment.status === 'quote_accepted') {
                                                                    return (
                                                                        <div className="text-center py-2 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 border border-gray-100">
                                                                            Quote Closed - Job Awarded
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <>
                                                                        <div className="flex items-center justify-center gap-1.5 mb-3">
                                                                            <Clock size={12} className={daysLeft <= 1 ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-green-500'} />
                                                                            <span className={`text-[10px] font-bold ${daysLeft <= 1 ? 'text-red-600' : daysLeft <= 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                                                                                {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to respond
                                                                            </span>
                                                                        </div>
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
                                                                    </>
                                                                );
                                                            }
                                                            return (
                                                                <div className="text-center py-2 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-400">
                                                                    Processed on {new Date(quote.created_at).toLocaleDateString()}
                                                                </div>
                                                            );
                                                        })()}
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
                    title="Secure Booking Deposit"
                    description={`Pay €40.00 deposit to book your assessment. The remaining balance of €${paymentQuote.balance?.toFixed(2)} will be payable directly to the assessor.`}
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
                            <h3 className="text-xl font-bold mb-1">
                                BER Assessor #{selectedDetailsQuote.contractor?.seai_number || selectedDetailsQuote.created_by.slice(0, 6)}
                            </h3>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-500 font-medium text-sm">Quote</span>
                                <span className="text-gray-900 font-black text-lg">€{selectedDetailsQuote.price + 10}</span>
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
                                Accept €{selectedDetailsQuote.price + 10} Quote
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Assessment Confirmation Modal */}
            {deletingAssessmentId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Job?</h3>
                            <p className="text-gray-500 font-medium mb-8 text-sm">Are you sure you want to delete this assessment? This action cannot be undone and will remove all associated quotes.</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleDeleteAssessment(deletingAssessmentId)}
                                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                >
                                    Yes, Delete Job
                                </button>
                                <button
                                    onClick={() => setDeletingAssessmentId(null)}
                                    className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
