
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LogOut, FileText, User, Calendar, Home, CheckCircle2, Clock, AlertCircle, X, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuoteModal from '../components/QuoteModal';
import EmailVerification from '../components/EmailVerification';

interface Quote {
    id: string;
    price: number;
    estimated_date: string | null;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    assessment_id: string;
    contractor?: {
        full_name: string;
        seai_number: string;
        assessor_type?: string;
    };
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
}

const UserDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [view, setView] = useState<'assessments' | 'quotes'>('assessments');
    const [verifyingQuote, setVerifyingQuote] = useState<{ assessmentId: string, quoteId: string, targetStatus: 'accepted' | 'rejected' } | null>(null);
    const [confirmReject, setConfirmReject] = useState<{ assessmentId: string, quoteId: string } | null>(null);
    const [verificationStep, setVerificationStep] = useState<1 | 2>(1);
    const [verifyEircode, setVerifyEircode] = useState('');

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
                            assessor_type
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
                // Fetch the quote to get the contractor_id
                const { data: quote, error: fetchError } = await supabase
                    .from('quotes')
                    .select('created_by')
                    .eq('id', quoteId)
                    .single();

                if (fetchError) throw fetchError;

                const { error: quoteError } = await supabase
                    .from('quotes')
                    .update({ status: newStatus })
                    .eq('id', quoteId);

                if (quoteError) throw quoteError;

                const { error: assessmentError } = await supabase
                    .from('assessments')
                    .update({
                        status: 'quote_accepted',
                        contractor_id: quote.created_by
                    })
                    .eq('id', assessmentId);

                if (assessmentError) throw assessmentError;

                // Notify homeowner and contractor about the acceptance
                supabase.functions.invoke('send-acceptance-notification', {
                    body: { assessmentId, quoteId }
                }).catch(err => console.error('Failed to trigger acceptance notification:', err));

                toast.success('Quote accepted!');
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

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="text-green-500" size={18} />;
            case 'scheduled': return <Calendar className="text-blue-500" size={18} />;
            case 'quote_accepted': return <CheckCircle2 className="text-indigo-500" size={18} />;
            case 'pending_quote': return <Clock className="text-amber-500" size={18} />;
            case 'submitted': return <FileText className="text-blue-500" size={18} />;
            case 'draft': return <FileText className="text-gray-400" size={18} />;
            default: return <AlertCircle className="text-gray-500" size={18} />;
        }
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
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#007F00] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            BM
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">My Dashboard</h1>
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900">{user?.email?.split('@')[0]}</span>
                            <span className="text-xs text-gray-500">{user?.email}</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-all border border-gray-200 px-4 py-2 rounded-full hover:bg-red-50 hover:border-red-100"
                        >
                            <LogOut size={16} />
                            <span className="hidden xs:block">Sign Out</span>
                        </button>
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
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {view === 'assessments' ? 'Your BER Assessments' : 'Received Quotes'}
                                </h2>
                                <p className="text-gray-500">
                                    {view === 'assessments' ? 'Track the progress of your property certification' : 'Review and manage quotes from our verified contractors'}
                                </p>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setView('assessments')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'assessments' ? 'bg-white text-[#007F00] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Assessments
                                </button>
                                <button
                                    onClick={() => setView('quotes')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'quotes' ? 'bg-white text-[#007F00] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Quotes
                                    {assessments.reduce((acc, a) => acc + (a.quotes?.filter(q => q.status === 'pending').length || 0), 0) > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                            {assessments.reduce((acc, a) => acc + (a.quotes?.filter(q => q.status === 'pending').length || 0), 0)}
                                        </span>
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={() => setIsQuoteModalOpen(true)}
                                className="bg-[#007F00] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#006600] transition-all shadow-md active:scale-95"
                            >
                                New Assessment
                            </button>
                        </div>

                        {view === 'assessments' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {assessments.map((assessment) => (
                                    /* Assessment Card ... keeps existing code but wrapped */
                                    <div
                                        key={assessment.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-green-50 transition-colors">
                                                <Home size={24} className="text-gray-400 group-hover:text-[#007F00]" />
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyles(assessment.status)}`}>
                                                    {assessment.status.replace('_', ' ')}
                                                </span>
                                                {assessment.quotes && assessment.quotes.some(q => q.status === 'pending') && (
                                                    <span className="bg-[#007F00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                        New Quote
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                            {assessment.property_address}
                                        </h3>

                                        <div className="space-y-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    {getStatusIcon(assessment.status)}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Status</p>
                                                    <p className="font-medium text-gray-700 capitalize">{assessment.status}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    <Calendar size={18} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                        {assessment.scheduled_date ? 'Scheduled Date' : 'Preferred Date'}
                                                    </p>
                                                    <p className="font-medium text-gray-700">
                                                        {assessment.scheduled_date
                                                            ? new Date(assessment.scheduled_date).toLocaleDateString('en-IE', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })
                                                            : assessment.preferred_date ? (
                                                                <>
                                                                    {new Date(assessment.preferred_date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                                                                    <span className="text-gray-400 font-normal mx-1">•</span>
                                                                    {assessment.preferred_time}
                                                                </>
                                                            ) : 'TBC'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            {assessment.status === 'draft' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedAssessment(assessment)}
                                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleSubmitAssessment(assessment.id)}
                                                        className="flex-1 py-2.5 rounded-xl bg-[#007F00] text-white text-sm font-semibold hover:bg-[#006600] transition-all"
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedAssessment(assessment)}
                                                    className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-[#007F00] hover:border-[#007F00] transition-all"
                                                >
                                                    {assessment.status === 'completed' ? 'View Certificate' : 'View Details'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
                                        <p className="text-gray-500 max-w-sm mx-auto">Once contractors review your submitted assessments, their quotes will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        {assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a })))
                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((quote) => (
                                                <div key={quote.id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                                    <div className="p-6 sm:p-8">
                                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                                            {/* Main Quote Info */}
                                                            <div className="flex-1 min-w-[200px]">
                                                                <div className="flex items-center gap-4 mb-2">
                                                                    <h4 className="text-4xl font-black text-gray-900">€{quote.price}</h4>
                                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${quote.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                        quote.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                            'bg-green-50 text-[#007F00] border-green-100'
                                                                        }`}>
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs font-bold text-gray-400">Received {new Date(quote.created_at).toLocaleDateString()}</p>
                                                                {quote.contractor && (
                                                                    <div className="mt-2 text-xs text-gray-500">
                                                                        <span className="font-bold text-gray-700">{quote.contractor.full_name}</span>
                                                                        {quote.contractor.seai_number && (
                                                                            <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-600 border border-gray-200">
                                                                                SEAI: {quote.contractor.seai_number}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Property Details */}
                                                            <div className="flex-[2] bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white rounded-xl shadow-xs flex items-center justify-center text-gray-400">
                                                                    <Home size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Property for Assessment</p>
                                                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{quote.assessment.property_address}</p>
                                                                </div>
                                                            </div>

                                                            {/* Actions or Status placeholder */}
                                                            <div className="flex-1 flex lg:justify-end">
                                                                {quote.status === 'pending' ? (
                                                                    <div className="flex gap-3 w-full lg:w-auto">
                                                                        <button
                                                                            onClick={() => setConfirmReject({ assessmentId: quote.assessment_id || quote.assessment.id, quoteId: quote.id })}
                                                                            className="px-6 py-3 border border-red-100 text-red-600 rounded-xl font-black text-sm hover:bg-red-50 transition-all text-center whitespace-nowrap"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setVerifyingQuote({ assessmentId: quote.assessment_id || quote.assessment.id, quoteId: quote.id, targetStatus: 'accepted' });
                                                                                setVerificationStep(1);
                                                                                setVerifyEircode('');
                                                                            }}
                                                                            className="px-8 py-3 bg-[#007F00] text-white rounded-xl font-black text-sm hover:bg-[#006600] transition-all shadow-lg shadow-green-100 text-center whitespace-nowrap"
                                                                        >
                                                                            Accept Quote
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-right">
                                                                        <p className="text-xs font-bold text-gray-400 mb-1">Status Date</p>
                                                                        <p className="text-sm font-bold text-gray-700">Updated {new Date(quote.created_at).toLocaleDateString()}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Optional Details Row */}
                                                        {(quote.notes || quote.estimated_date) && (
                                                            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                                                {quote.estimated_date && (
                                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-amber-50/50 px-3 py-1.5 rounded-lg border border-amber-100/50">
                                                                        <Calendar size={16} className="text-amber-500" />
                                                                        Proposed: <span className="text-gray-900">{new Date(quote.estimated_date).toLocaleDateString()}</span>
                                                                    </div>
                                                                )}
                                                                {quote.notes && (
                                                                    <div className="flex-1 text-sm text-gray-600 italic leading-relaxed">
                                                                        <span className="text-gray-400 font-black not-italic mr-2">Notes:</span>
                                                                        "{quote.notes}"
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
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
                                                        <p className="text-2xl font-bold text-gray-900">€{quote.price}</p>
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
            {/* Quote Verification Modal */}
            {verifyingQuote && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
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
                            <div className="p-6">
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
                            <p className="text-gray-500 font-medium mb-8">This action cannot be undone. You will need to wait for other contractors to provide new quotes.</p>

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
        </div>
    );
};

export default UserDashboard;
