import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LogOut, HardHat, ClipboardList, CheckCircle2, Clock, X, TrendingUp, DollarSign, Briefcase, Calendar, MapPin, ArrowRight, ArrowLeft, AlertTriangle, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Quote {
    id: string;
    price: number;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    assessment_id: string;
    lowestPrice?: number;
    assessment?: {
        id: string;
        town: string;
        county: string;
        property_type: string;
        property_size: string;
        bedrooms: number;
        heat_pump: string;
        ber_purpose: string;
        additional_features: string[];
        preferred_date: string;
        preferred_time?: string;
        created_at: string;
        property_address?: string;
    };
}

interface Assessment {
    id: string;
    property_address: string;
    town: string;
    county: string;
    property_type: string;
    status: 'live' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed';
    created_at: string;
    scheduled_date: string | null;
    user_id: string;
    property_size: string;
    bedrooms: number;
    additional_features: string[];
    heat_pump: string;
    ber_purpose: string;
    preferred_date: string;
    preferred_time: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    certificate_url?: string;
    profiles?: {
        full_name: string;
    };
    quotes?: Quote[];
}

const ContractorDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState<'available' | 'my_quotes' | 'active'>('available');
    const [availableJobs, setAvailableJobs] = useState<Assessment[]>([]);
    const [myQuotes, setMyQuotes] = useState<Quote[]>([]);
    const [activeJobs, setActiveJobs] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedJob, setSelectedJob] = useState<Assessment | null>(null);
    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [quotePrice, setQuotePrice] = useState('');
    const [quoteNotes, setQuoteNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
    const [schedulingJob, setSchedulingJob] = useState<Assessment | null>(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [completingJob, setCompletingJob] = useState<Assessment | null>(null);
    const [certUrl, setCertUrl] = useState('');

    // Multi-step Quoting & Rejection States
    const [quoteStep, setQuoteStep] = useState<1 | 2 | 3 | 4>(1); // 1: Date picker, 2: Quote form, 3: Review, 4: OTP
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
    const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState<string | null>(null);
    const [termsAgreed, setTermsAgreed] = useState(false);



    useEffect(() => {
        if (user) {
            fetchData();

            // Real-time updates
            const channel = supabase
                .channel('contractor-dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => fetchData())
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Available Jobs (submitted status, no quote from this contractor yet)
            const { data: jobs, error: jobsError } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    quotes (*)
                `)
                .in('status', ['live', 'submitted', 'pending_quote'])
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            // 2. Fetch My Quotes with assessment details
            const { data: quotes, error: quotesError } = await supabase
                .from('quotes')
                .select(`
                    *,
                    assessment:assessment_id (
                        id,
                        town,
                        county,
                        property_type,
                        property_size,
                        bedrooms,
                        heat_pump,
                        ber_purpose,
                        additional_features,
                        preferred_date,
                        preferred_time,
                        created_at,
                        property_address
                    )
                `)
                .eq('created_by', user?.id)
                .order('created_at', { ascending: false });

            if (quotesError) throw quotesError;

            // 3. Fetch lowest quotes for these assessments
            const assessmentIds = quotes?.map(q => q.assessment_id) || [];
            let enrichedQuotes = quotes || [];

            if (assessmentIds.length > 0) {
                const { data: allQuotes, error: allQuotesError } = await supabase
                    .from('quotes')
                    .select('assessment_id, price')
                    .in('assessment_id', assessmentIds);

                if (!allQuotesError && allQuotes) {
                    const minPrices: Record<string, number> = {};
                    allQuotes.forEach(q => {
                        if (!minPrices[q.assessment_id] || q.price < minPrices[q.assessment_id]) {
                            minPrices[q.assessment_id] = q.price;
                        }
                    });

                    enrichedQuotes = (quotes || []).map(q => ({
                        ...q,
                        lowestPrice: minPrices[q.assessment_id] || q.price
                    }));
                }
            }

            // 4. Update states
            setMyQuotes(enrichedQuotes);

            // Available jobs are those without a quote from this contractor
            const quotedIds = new Set(quotes?.map(q => q.assessment_id) || []);
            setAvailableJobs(jobs?.filter(j => !quotedIds.has(j.id)) || []);

            // Active jobs are those where contractor_id matches this contractor
            const { data: active, error: activeError } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    contact_name,
                    contact_email,
                    contact_phone,
                    certificate_url
                `)
                .eq('contractor_id', user?.id)
                .order('created_at', { ascending: false });

            if (activeError) throw activeError;
            setActiveJobs(active || []);

        } catch (error: any) {
            console.error('Error fetching contractor data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const handleStartQuote = () => {
        setJobDetailsModalOpen(false);
        setQuoteModalOpen(true);
        setQuoteStep(1);
        setSelectedAvailabilityDate(null);
        setTermsAgreed(false);
        setQuotePrice('');
        setQuoteNotes('');
    };

    const handleReQuote = (quote: Quote) => {
        if (!quote.assessment) return;

        // Map Quote assessment data back to Assessment interface
        const jobData: Assessment = {
            id: quote.assessment_id,
            property_address: quote.assessment.property_address || '',
            town: quote.assessment.town,
            county: quote.assessment.county,
            property_type: quote.assessment.property_type,
            property_size: quote.assessment.property_size,
            bedrooms: quote.assessment.bedrooms,
            heat_pump: quote.assessment.heat_pump,
            ber_purpose: quote.assessment.ber_purpose,
            additional_features: quote.assessment.additional_features,
            created_at: quote.assessment.created_at,
            preferred_date: quote.assessment.preferred_date,
            preferred_time: quote.assessment.preferred_time || '',
            status: 'pending_quote', // Default status for quoting
            scheduled_date: null,
            user_id: '' // Not strictly needed for the modal
        };

        setSelectedJob(jobData);
        setQuoteModalOpen(true);
        setQuoteStep(1);
        setSelectedAvailabilityDate(null);
        setTermsAgreed(false);
        setQuotePrice('');
        setQuoteNotes('');
    };



    const handleSubmitQuote = async () => {
        if (!selectedJob || !quotePrice || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const { error } = await supabase.from('quotes').insert({
                assessment_id: selectedJob.id,
                price: parseFloat(quotePrice),
                notes: quoteNotes,
                created_by: user?.id,
                status: 'pending'
            });

            if (error) throw error;

            if (selectedJob.status === 'submitted') {
                await supabase
                    .from('assessments')
                    .update({ status: 'pending_quote' })
                    .eq('id', selectedJob.id);
            }

            // Notify homeowner about the new quote
            supabase.functions.invoke('send-quote-notification', {
                body: { assessmentId: selectedJob.id }
            }).catch(err => console.error('Failed to trigger homeowner notification:', err));

            toast.success('Quote submitted successfully!');
            setQuoteModalOpen(false);
            setQuotePrice('');
            setQuoteNotes('');
            setSelectedJob(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit quote');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectJob = async () => {
        if (!selectedJob || !rejectionReason || isSubmitting) return;

        try {
            setIsSubmitting(true);
            // Log rejection 
            const { error } = await supabase.from('audit_logs').insert({
                user_id: user?.id,
                action: 'lead_rejected',
                details: {
                    assessment_id: selectedJob.id,
                    reason: rejectionReason,
                    address: selectedJob.property_address
                }
            });

            if (error) throw error;

            toast.success('Lead rejected. It will no longer appear in your list.');
            setRejectionModalOpen(false);
            setJobDetailsModalOpen(false);
            setRejectionReason('');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject lead');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (jobId: string, newStatus: string, extraData: any = {}) => {
        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from('assessments')
                .update({
                    status: newStatus,
                    ...extraData
                })
                .eq('id', jobId);

            if (error) throw error;

            toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
            setSchedulingJob(null);
            setCompletingJob(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = {
        earnings: myQuotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + Number(q.price), 0),
        pending: myQuotes.filter(q => q.status === 'pending').length,
        completed: activeJobs.filter(j => j.status === 'completed').length,
        totalQuotes: myQuotes.length
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Nav */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="w-full px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#007EA7] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <HardHat size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Assessor Portal</h1>
                            <span className="text-[10px] font-bold text-[#007EA7] uppercase tracking-widest">Licensed BER Assessor</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900">{user?.email?.split('@')[0]}</span>
                            <span className="text-[10px] text-gray-400 font-medium">Verified Partner</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="w-full px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <DollarSign size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Earnings</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">€{stats.earnings.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Clock size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Quotes</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stats.pending}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jobs Done</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stats.completed}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quote Success</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">
                            {stats.totalQuotes > 0 ? Math.round((stats.completed / stats.totalQuotes) * 100) : 0}%
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50/50">
                        <button
                            onClick={() => setView('available')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${view === 'available' ? 'bg-[#007EA7] text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                        >
                            <Briefcase size={18} />
                            Available Jobs
                            {availableJobs.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{availableJobs.length}</span>}
                        </button>
                        <button
                            onClick={() => setView('my_quotes')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${view === 'my_quotes' ? 'bg-[#007EA7] text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                        >
                            <ClipboardList size={18} />
                            My Quotes
                        </button>
                        <button
                            onClick={() => setView('active')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${view === 'active' ? 'bg-[#007EA7] text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                        >
                            <ClipboardList size={18} />
                            Active Jobs
                        </button>
                    </div>

                    <div className="flex-1 p-6">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-blue-50 border-t-[#007EA7] rounded-full animate-spin"></div>
                                <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Refreshing Dashboard...</p>
                            </div>
                        ) : view === 'available' ? (
                            availableJobs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <Briefcase size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs available right now</h3>
                                    <p className="text-gray-500 max-w-sm">We'll notify you when new assessment requests are submitted by homeowners in your area.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    {/* Desktop Table View */}
                                    <table className="w-full text-sm hidden md:table">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Posted</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Town</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">County</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sq. Mt.</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Beds</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Heat Pump</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Addition</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Date</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableJobs.map((job, index) => (
                                                <tr
                                                    key={job.id}
                                                    className={`border-b border-gray-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                >
                                                    <td className="py-3 px-4 text-gray-600 font-medium">
                                                        {new Date(job.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-900 font-bold">{job.town}</td>
                                                    <td className="py-3 px-4 text-gray-600">{job.county}</td>
                                                    <td className="py-3 px-4 text-gray-600">{job.property_type}</td>
                                                    <td className="py-3 px-4 text-gray-600">{job.property_size}</td>
                                                    <td className="py-3 px-4 text-gray-600">{job.bedrooms}</td>
                                                    <td className="py-3 px-4 text-gray-600">{job.heat_pump}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${job.ber_purpose?.toLowerCase().includes('mortgage') ? 'bg-blue-100 text-blue-700' :
                                                            job.ber_purpose?.toLowerCase().includes('grant') ? 'bg-green-100 text-green-700' :
                                                                job.ber_purpose?.toLowerCase().includes('letting') ? 'bg-amber-100 text-amber-700' :
                                                                    job.ber_purpose?.toLowerCase().includes('selling') ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {job.ber_purpose}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">
                                                        {job.additional_features?.length > 0 ? job.additional_features.join(', ') : 'None'}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">{job.preferred_date || 'Flexible'}</td>
                                                    <td className="py-3 px-4">
                                                        {(() => {
                                                            const daysSincePosted = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
                                                            const isRecent = daysSincePosted <= 2;
                                                            return (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedJob(job);
                                                                        setJobDetailsModalOpen(true);
                                                                    }}
                                                                    className={`px-4 py-2 text-white rounded-lg text-xs font-bold transition-all shadow-sm ${isRecent
                                                                        ? 'bg-yellow-500 hover:bg-yellow-600'
                                                                        : 'bg-green-600 hover:bg-green-700'
                                                                        }`}
                                                                >
                                                                    Quote
                                                                </button>
                                                            );
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden space-y-4">
                                        {availableJobs.map(job => (
                                            <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{job.town}, {job.county}</p>
                                                        <p className="text-xs text-gray-500">{job.property_type} • {job.bedrooms} beds</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(job.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{job.ber_purpose}</span>
                                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{job.heat_pump}</span>
                                                </div>
                                                {(() => {
                                                    const daysSincePosted = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
                                                    const isRecent = daysSincePosted <= 2;
                                                    return (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedJob(job);
                                                                setJobDetailsModalOpen(true);
                                                            }}
                                                            className={`w-full py-3 text-white rounded-xl font-bold transition-all ${isRecent
                                                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                                                : 'bg-green-600 hover:bg-green-700'
                                                                }`}
                                                        >
                                                            Quote
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ) : view === 'my_quotes' ? (
                            myQuotes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <ClipboardList size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">You haven't sent any quotes</h3>
                                    <p className="text-gray-500 max-w-sm">Tap on "Available Jobs" to find homeowners looking for BER assessments.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Header
                                    <div className="bg-[#007EA7] text-white p-6 rounded-xl text-center">
                                        <h2 className="text-xl font-bold mb-1">My Quotes</h2>
                                        <p className="text-sm text-white/80">Here's your live pending quotes.</p>
                                    </div> */}

                                    {/* Desktop Table View */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm hidden md:table">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Posted</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Town</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">County</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sq. Mt.</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Beds</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Heat Pump</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Addition</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Survey Date</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-[#8B0000] uppercase tracking-wider">Lowest Quote</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-green-700 uppercase tracking-wider">My Quote</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myQuotes.map((quote, index) => (
                                                    <tr
                                                        key={quote.id}
                                                        className={`border-b border-gray-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                    >
                                                        <td className="py-3 px-3 text-gray-600 font-medium">
                                                            {new Date(quote.assessment?.created_at || quote.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                        </td>
                                                        <td className="py-3 px-3 text-gray-900 font-bold">{quote.assessment?.town || '-'}</td>
                                                        <td className="py-3 px-3 text-gray-600">{quote.assessment?.county || '-'}</td>
                                                        <td className="py-3 px-3 text-gray-600">{quote.assessment?.property_type || '-'}</td>
                                                        <td className="py-3 px-3 text-gray-600">{quote.assessment?.property_size || '-'}</td>
                                                        <td className="py-3 px-3 text-gray-600">{quote.assessment?.bedrooms || '-'}</td>
                                                        <td className="py-3 px-3 text-gray-600">{quote.assessment?.heat_pump || 'None'}</td>
                                                        <td className="py-3 px-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${quote.assessment?.ber_purpose?.toLowerCase().includes('mortgage') ? 'bg-blue-100 text-blue-700' :
                                                                quote.assessment?.ber_purpose?.toLowerCase().includes('grant') ? 'bg-green-100 text-green-700' :
                                                                    quote.assessment?.ber_purpose?.toLowerCase().includes('letting') ? 'bg-amber-100 text-amber-700' :
                                                                        quote.assessment?.ber_purpose?.toLowerCase().includes('selling') ? 'bg-purple-100 text-purple-700' :
                                                                            'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {quote.assessment?.ber_purpose || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-gray-600">
                                                            {quote.assessment?.additional_features?.length ? quote.assessment.additional_features.join(', ') : 'None'}
                                                        </td>
                                                        <td className="py-3 px-3 text-gray-600">{quote.assessment?.preferred_date || 'Flexible'}</td>
                                                        <td className="py-3 px-3 text-[#8B0000] font-bold">€ {quote.lowestPrice?.toLocaleString() || '-'}</td>
                                                        <td className="py-3 px-3 text-green-700 font-bold">€{quote.price.toLocaleString()}</td>
                                                        <td className="py-3 px-3">
                                                            <button
                                                                onClick={() => handleReQuote(quote)}
                                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all"
                                                            >
                                                                Re-Quote
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {myQuotes.map(quote => (
                                                <div key={quote.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{quote.assessment?.town || '-'}, {quote.assessment?.county || '-'}</p>
                                                            <p className="text-xs text-gray-500">{quote.assessment?.property_type || '-'} • {quote.assessment?.bedrooms || 0} beds</p>
                                                        </div>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${quote.status === 'accepted' ? 'bg-green-100 text-green-700' : quote.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {quote.status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lowest Quote</p>
                                                            <p className="text-lg font-bold text-[#8B0000]">€ {quote.lowestPrice?.toLocaleString() || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">My Quote</p>
                                                            <p className="text-lg font-bold text-green-700">€{quote.price.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleReQuote(quote)}
                                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
                                                    >
                                                        Re-Quote
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            activeJobs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <HardHat size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active jobs</h3>
                                    <p className="text-gray-500 max-w-sm">When a homeowner accepts your quote, the job will appear here for you to manage.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Header */}
                                    {/* <div className="bg-[#007EA7] text-white p-6 rounded-xl text-center">
                                        <h2 className="text-xl font-bold mb-1">My Clients</h2>
                                        <p className="text-sm text-white/80">Here's your successful quotes on BerCert.com. Please contact <span className="text-yellow-300">your clients</span> within one business day.</p>
                                    </div> */}

                                    {/* Desktop Table View */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm hidden md:table">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Accepted</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Town</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">County</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-blue-600 uppercase tracking-wider">Eircode</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sq. Mt.</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Beds</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Heat Pump</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Addition</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Survey Date</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeJobs.map((job, index) => (
                                                    <>
                                                        <tr
                                                            key={job.id}
                                                            className={`border-b border-gray-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                        >
                                                            <td className="py-3 px-3 text-gray-600 font-medium">
                                                                {new Date(job.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-900 font-bold">{job.town}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.county}</td>
                                                            <td className="py-3 px-3">
                                                                <a href="#" className="text-blue-600 underline font-medium hover:text-blue-800">
                                                                    {job.property_address?.slice(0, 7) || 'N/A'}
                                                                </a>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600">{job.property_type}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.property_size}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.bedrooms}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.heat_pump || 'None'}</td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${job.ber_purpose?.toLowerCase().includes('mortgage') ? 'bg-blue-100 text-blue-700' :
                                                                    job.ber_purpose?.toLowerCase().includes('grant') ? 'bg-green-100 text-green-700' :
                                                                        job.ber_purpose?.toLowerCase().includes('letting') ? 'bg-amber-100 text-amber-700' :
                                                                            job.ber_purpose?.toLowerCase().includes('selling') ? 'bg-purple-100 text-purple-700' :
                                                                                'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {job.ber_purpose || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600">
                                                                {job.additional_features?.length ? job.additional_features.join(', ') : 'None'}
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600">
                                                                {job.scheduled_date
                                                                    ? new Date(job.scheduled_date).toLocaleDateString('en-IE', { weekday: 'short', day: '2-digit', month: 'short' })
                                                                    : job.preferred_date || 'TBD'
                                                                }
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <button
                                                                    onClick={() => setExpandedContactId(expandedContactId === job.id ? null : job.id)}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all"
                                                                >
                                                                    Contact Details
                                                                </button>
                                                            </td>
                                                            <td className="py-3 px-3 text-green-700 font-bold">
                                                                €{job.quotes?.[0]?.price?.toLocaleString() || '200'}
                                                            </td>
                                                        </tr>
                                                        {/* Expandable Contact Details Row */}
                                                        {expandedContactId === job.id && (
                                                            <tr key={`${job.id}-contact`} className="bg-white border-b border-gray-100">
                                                                <td colSpan={13} className="py-3 px-6">
                                                                    <div className="flex items-center gap-6 text-sm">
                                                                        <span className="text-gray-400">↳</span>
                                                                        <span><strong>Name:</strong> {job.contact_name || job.profiles?.full_name || 'N/A'}</span>
                                                                        <span><strong>Email:</strong> <a href={`mailto:${job.contact_email}`} className="text-blue-600 hover:underline">{job.contact_email || 'N/A'}</a></span>
                                                                        <span><strong>Phone:</strong> <a href={`tel:${job.contact_phone}`} className="text-blue-600 hover:underline">{job.contact_phone || 'N/A'}</a></span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {activeJobs.map(job => (
                                                <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{job.town}, {job.county}</p>
                                                            <p className="text-xs text-gray-500">{job.property_type} • {job.bedrooms} beds</p>
                                                        </div>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${job.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                                            {job.status?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div>
                                                            <p className="text-xs text-gray-400">Balance</p>
                                                            <p className="text-lg font-bold text-green-700">€{job.quotes?.[0]?.price?.toLocaleString() || '200'}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(job.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                        </p>
                                                    </div>
                                                    {job.contact_phone && (
                                                        <div className="flex flex-wrap gap-2 mb-4 text-xs">
                                                            <a href={`tel:${job.contact_phone}`} className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                                <Phone size={12} /> {job.contact_phone}
                                                            </a>
                                                            <a href={`mailto:${job.contact_email}`} className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                                <Mail size={12} /> Email
                                                            </a>
                                                        </div>
                                                    )}
                                                    <button
                                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
                                                    >
                                                        Contact Details
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>

            {/* Job Details Modal - STEP 1 */}
            {jobDetailsModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-white border-b border-gray-100 p-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Job Opportunity</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">Review the details before proceeding</p>
                            </div>
                            <button onClick={() => setJobDetailsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin size={14} className="text-[#007EA7]" />
                                        {selectedJob.town}, {selectedJob.county}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Type</span>
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <HardHat size={14} className="text-[#007EA7]" />
                                        {selectedJob.property_type}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.property_size}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bedrooms</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.bedrooms}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Purpose</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.ber_purpose}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Heat Pump</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.heat_pump}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">Preferred Schedule</span>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Calendar size={14} />
                                            {selectedJob.preferred_date} at {selectedJob.preferred_time}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">Features</span>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedJob.additional_features && selectedJob.additional_features.length > 0 ? (
                                                selectedJob.additional_features.map((feature, i) => (
                                                    <span key={i} className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                                        {feature}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">Standard property</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block mb-2">Internal Reference</span>
                                <p className="text-base font-bold text-gray-900 leading-relaxed italic">
                                    "{selectedJob.property_address}"
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setJobDetailsModalOpen(false);
                                            setRejectionModalOpen(true);
                                        }}
                                        className="flex-1 py-4 text-red-500 rounded-2xl font-bold bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={20} />
                                        Reject Lead
                                    </button>
                                    <button
                                        onClick={handleStartQuote}
                                        className="flex-[2] py-4 bg-[#007EA7] text-white rounded-2xl font-black text-lg hover:bg-[#005F7E] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                                    >
                                        Start Quoting
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setJobDetailsModalOpen(false)}
                                    className="text-sm text-gray-400 font-bold hover:text-gray-600"
                                >
                                    Decide Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Modal - DATE PICKER + QUOTE FORM */}
            {quoteModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 relative">

                        {/* Step 1: Date Picker */}
                        {quoteStep === 1 && (
                            <div className="p-8">
                                <button
                                    onClick={() => setQuoteModalOpen(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                >
                                    <X size={24} />
                                </button>

                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Earliest date you can do the survey.</h2>
                                    <p className="text-sm text-gray-600">
                                        The <span className="text-amber-600 underline">highlighted date</span> is the customer's preferred date & time.
                                        Select the earliest date that you are available, even if it's before the customer's preferred date.
                                    </p>
                                </div>

                                {/* Calendar Grid - 30 days */}
                                <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-2">
                                    {Array.from({ length: 30 }, (_, i) => {
                                        const date = new Date();
                                        date.setDate(date.getDate() + i);
                                        const dateStr = date.toISOString().split('T')[0];
                                        const isPreferred = selectedJob.preferred_date === dateStr ||
                                            new Date(selectedJob.preferred_date).toDateString() === date.toDateString();
                                        const isSelected = selectedAvailabilityDate === dateStr;

                                        return (
                                            <button
                                                key={dateStr}
                                                onClick={() => setSelectedAvailabilityDate(dateStr)}
                                                className={`p-4 rounded-lg border-2 text-center transition-all ${isSelected
                                                    ? 'border-green-500 bg-green-50'
                                                    : isPreferred
                                                        ? 'border-amber-400 bg-amber-50'
                                                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                                                    }`}
                                            >
                                                <p className="text-sm font-medium text-gray-600">
                                                    {date.toLocaleDateString('en-IE', { weekday: 'long' })}
                                                </p>
                                                <p className={`text-lg font-bold ${isSelected ? 'text-green-700' : isPreferred ? 'text-amber-700' : 'text-gray-800'}`}>
                                                    {date.toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                </p>
                                                {isPreferred && (
                                                    <p className="text-[10px] text-amber-600 font-medium mt-1">
                                                        ({selectedJob.preferred_time || '8am - 10am'})
                                                    </p>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        onClick={() => setQuoteModalOpen(false)}
                                        className="flex-1 py-4 text-gray-500 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setQuoteStep(2)}
                                        disabled={!selectedAvailabilityDate}
                                        className="flex-[2] py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        Continue
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Quote Form with Job Details */}
                        {quoteStep === 2 && (
                            <div>
                                {/* Header */}
                                <div className="bg-green-100 p-6 text-center border-b border-green-200 relative">
                                    <button
                                        onClick={() => setQuoteModalOpen(false)}
                                        className="absolute top-4 right-4 text-green-700 hover:text-green-900 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                    <h2 className="text-xl font-bold text-green-800">Quote for this job in {selectedJob.town}, Co. {selectedJob.county}</h2>
                                    <p className="text-sm text-green-600">Submit your quote below.</p>
                                </div>

                                <div className="p-6 grid md:grid-cols-2 gap-6">
                                    {/* Left: Job Details */}
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="bg-gray-200 px-4 py-3 border-b border-gray-300">
                                            <h3 className="font-bold text-gray-700 text-center">Job Details</h3>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            <div className="flex justify-between px-4 py-3">
                                                <span className="text-gray-600">Location:</span>
                                                <span className="font-medium text-gray-800">{selectedJob.town}, Co. {selectedJob.county}</span>
                                            </div>
                                            <div className="flex justify-between px-4 py-3">
                                                <span className="text-gray-600">Eircode:</span>
                                                <a href="#" className="font-medium text-blue-600 underline">{selectedJob.property_address?.slice(0, 7) || 'N/A'}</a>
                                            </div>
                                            <div className="flex justify-between px-4 py-3">
                                                <span className="text-gray-600">Property Type:</span>
                                                <span className="font-medium text-gray-800">{selectedJob.property_type}</span>
                                            </div>
                                            <div className="flex justify-between px-4 py-3">
                                                <span className="text-gray-600">Size:</span>
                                                <span className="font-medium text-gray-800">{selectedJob.property_size}</span>
                                            </div>
                                            <div className="flex justify-between px-4 py-3">
                                                <span className="text-gray-600">Beds:</span>
                                                <span className="font-medium text-gray-800">{selectedJob.bedrooms}</span>
                                            </div>
                                            <div className="flex justify-between px-4 py-3">
                                                <span className="text-gray-600">Heat Pump:</span>
                                                <span className="font-medium text-gray-800">{selectedJob.heat_pump || 'None'}</span>
                                            </div>
                                            <div className="flex justify-between px-4 py-3">
                                                <span className="text-gray-600">Additions:</span>
                                                <span className="font-medium text-gray-800">{selectedJob.additional_features?.length ? selectedJob.additional_features.join(', ') : 'None'}</span>
                                            </div>
                                            <div className="flex justify-between px-4 py-3">
                                                <span className="text-gray-600">Purpose:</span>
                                                <span className="font-medium text-gray-800">{selectedJob.ber_purpose}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Your Quote */}
                                    <div className="bg-green-50 rounded-xl border border-green-200 overflow-hidden">
                                        <div className="bg-green-200 px-4 py-3 border-b border-green-300">
                                            <h3 className="font-bold text-green-800 text-center">Your Quote</h3>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <p className="text-sm text-green-700 text-center italic">Include SEAI fees.</p>
                                            <p className="text-sm text-green-700 text-center italic">Include VAT (if registered).</p>
                                            <p className="text-sm text-green-700 text-center italic">Include €30 BerCert.com fee.</p>

                                            <div className="relative mt-4">
                                                <input
                                                    type="number"
                                                    value={quotePrice}
                                                    onChange={(e) => setQuotePrice(e.target.value)}
                                                    className="w-full bg-white border-2 border-gray-200 focus:border-green-500 rounded-lg px-4 py-3 text-center text-xl font-bold outline-none transition-all"
                                                    placeholder="170"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 text-center">Eg. 170, no euro sign or cents.</p>

                                            <div className="flex items-start gap-2 mt-4">
                                                <input
                                                    type="checkbox"
                                                    id="termsCheck"
                                                    checked={termsAgreed}
                                                    onChange={(e) => setTermsAgreed(e.target.checked)}
                                                    className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                                />
                                                <label htmlFor="termsCheck" className="text-sm text-gray-600">
                                                    I agree to the <a href="#" className="text-blue-600 underline">terms of use</a>
                                                </label>
                                            </div>
                                            <p className="text-sm text-gray-500 text-center">
                                                and I am available from {selectedAvailabilityDate ? new Date(selectedAvailabilityDate).toLocaleDateString('en-IE', { weekday: 'short', day: '2-digit', month: 'short' }) : 'selected date'}.
                                            </p>

                                            <button
                                                onClick={handleSubmitQuote}
                                                disabled={!quotePrice || !termsAgreed || isSubmitting}
                                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Quote'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Back button */}
                                <div className="px-6 pb-6 flex justify-start">
                                    <button
                                        onClick={() => setQuoteStep(1)}
                                        className="text-sm font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                    >
                                        <ArrowLeft size={14} /> Back to date selection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectionModalOpen && selectedJob && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900">Reject this lead?</h3>
                                <p className="text-sm text-gray-500 font-medium">Please let us know why you're unable to take this job.</p>
                            </div>

                            <select
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                            >
                                <option value="">Select a reason...</option>
                                <option value="too_busy">Too busy / High workload</option>
                                <option value="outside_area">Outside my service area</option>
                                <option value="incorrect_requirements">Incorrect property requirements</option>
                                <option value="safety_concerns">Safety or access concerns</option>
                                <option value="other">Other reason</option>
                            </select>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setRejectionModalOpen(false)}
                                    className="flex-1 py-4 text-gray-500 font-bold bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectJob}
                                    disabled={!rejectionReason || isSubmitting}
                                    className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Scheduling Modal */}
            {schedulingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Schedule Inspection</h3>
                            <button onClick={() => setSchedulingJob(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inspection Date</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#007EA7] transition-colors font-bold text-gray-900"
                                />
                            </div>
                            <button
                                onClick={() => handleUpdateStatus(schedulingJob.id, 'scheduled', { scheduled_date: scheduledDate })}
                                disabled={isSubmitting || !scheduledDate}
                                className="w-full bg-[#007EA7] text-white py-4 rounded-2xl font-bold hover:bg-[#005F7E] transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Completion Modal */}
            {completingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Complete Job</h3>
                            <button onClick={() => setCompletingJob(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">BER Certificate URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={certUrl}
                                    onChange={(e) => setCertUrl(e.target.value)}
                                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#007EA7] transition-colors font-bold text-gray-900"
                                />
                                <p className="text-[10px] text-gray-400 mt-2 font-medium italic">Please provide a link to the generated BER certificate.</p>
                            </div>
                            <button
                                onClick={() => handleUpdateStatus(completingJob.id, 'completed', { certificate_url: certUrl })}
                                disabled={isSubmitting || !certUrl}
                                className="w-full bg-[#007F00] text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Completing...' : 'Submit & Complete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractorDashboard;
