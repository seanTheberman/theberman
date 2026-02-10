import { useEffect, useState, Fragment } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LogOut, HardHat, ClipboardList, CheckCircle2, Clock, X, TrendingUp, DollarSign, Briefcase, Calendar, MapPin, ArrowRight, ArrowLeft, AlertTriangle, Settings, MessageCircle, User, Menu } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
        scheduled_date: string | null;
        completed_at?: string | null;
        user_id: string;
        status: 'live' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed';
        eircode?: string;
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
    completed_at?: string | null;
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
    payment_status?: string;
    eircode?: string;
}

const COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
    'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
];

const ContractorDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState<'available' | 'my_quotes' | 'active' | 'settings'>('available');
    const [profile, setProfile] = useState<any>(null);
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);



    useEffect(() => {
        if (user) {
            fetchData();

            // Real-time updates
            const channel = supabase
                .channel('contractor-dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Profile Data (needed for location filtering)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (!profileError && profileData) {
                setProfile(profileData);
            }

            // 2. Fetch Available Jobs (submitted status, no quote from this contractor yet)
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

            // 3. Fetch My Quotes with assessment details
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
                        property_address,
                        eircode
                    )
                `)
                .eq('created_by', user?.id)
                .order('created_at', { ascending: false });

            if (quotesError) throw quotesError;

            // Filter out duplicates (keep only the latest quote per assessment)
            const uniqueQuotesMap = new Map();
            quotes?.forEach(q => {
                if (!uniqueQuotesMap.has(q.assessment_id)) {
                    uniqueQuotesMap.set(q.assessment_id, q);
                }
            });
            const uniqueQuotes = Array.from(uniqueQuotesMap.values());

            // 4. Fetch lowest quotes for these assessments
            const assessmentIds = uniqueQuotes.map(q => q.assessment_id);
            let enrichedQuotes = uniqueQuotes;

            if (assessmentIds.length > 0) {
                const { data: lowestQuotesData, error: rpcError } = await supabase
                    .rpc('get_assessment_lowest_quotes', { p_assessment_ids: assessmentIds });

                if (!rpcError && lowestQuotesData) {
                    const minPrices: Record<string, number> = {};
                    lowestQuotesData.forEach((item: any) => {
                        minPrices[item.assessment_id] = item.min_price;
                    });

                    enrichedQuotes = uniqueQuotes.map(q => ({
                        ...q,
                        lowestPrice: minPrices[q.assessment_id] || q.price
                    }));
                }
            }

            // 5. Update states
            setMyQuotes(enrichedQuotes);

            // Available jobs filtering:
            // 1. Exclude jobs already quoted for
            const quotedIds = new Set(quotes?.map(q => q.assessment_id) || []);
            let filteredAvailableJobs = jobs?.filter(j => !quotedIds.has(j.id)) || [];

            // 2. Apply location preference filtering if configured
            if (profileData?.preferred_counties && profileData.preferred_counties.length > 0) {
                filteredAvailableJobs = filteredAvailableJobs.filter(job =>
                    profileData.preferred_counties.includes(job.county)
                );
            }

            // 3. Apply Assessor Type filtering (Domestic vs Commercial)
            const assessorType = profileData?.assessor_type || '';
            const isDomesticAssessor = assessorType.includes('Domestic');
            const isCommercialAssessor = assessorType.includes('Commercial');

            filteredAvailableJobs = filteredAvailableJobs.filter(job => {
                // Determine if the job is domestic or commercial based on property_type
                // These are common commercial indicators. Can be expanded as the system grows.
                const commercialTypes = ['Commercial', 'Office', 'Retail', 'Industrial', 'Warehouse', 'Unit', 'Retail Unit'];

                // Multi-Unit is usually domestic in this flow but we check specifically if "Office" etc is in the address/type
                const isCommercialJob = commercialTypes.some(type =>
                    job.property_type?.toLowerCase().includes(type.toLowerCase()) ||
                    job.property_address?.toLowerCase().includes(type.toLowerCase())
                );

                if (isCommercialJob) {
                    return isCommercialAssessor;
                } else {
                    // Default to domestic if not explicitly commercial
                    return isDomesticAssessor;
                }
            });

            setAvailableJobs(filteredAvailableJobs);

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

            // Map quotes to active jobs manually for reliability
            const activeWithQuotes = (active || []).map(job => ({
                ...job,
                quotes: quotes?.filter(q => q.assessment_id === job.id) || []
            }));

            setActiveJobs(activeWithQuotes);

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
            scheduled_date: quote.assessment.scheduled_date,
            completed_at: quote.assessment.completed_at,
            user_id: quote.assessment.user_id,
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
            const existingQuote = myQuotes.find(q => q.assessment_id === selectedJob.id);

            let error;
            if (existingQuote) {
                const { error: updateError } = await supabase
                    .from('quotes')
                    .update({
                        price: parseFloat(quotePrice),
                        notes: quoteNotes,
                        status: 'pending' // Reset status to pending on re-quote
                    })
                    .eq('id', existingQuote.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('quotes').insert({
                    assessment_id: selectedJob.id,
                    price: parseFloat(quotePrice),
                    notes: quoteNotes,
                    created_by: user?.id,
                    status: 'pending'
                });
                error = insertError;
            }

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

            // Fetch current job to check if it was already scheduled (for rescheduling notification)
            const { data: currentJob } = await supabase
                .from('assessments')
                .select('status, scheduled_date')
                .eq('id', jobId)
                .single();

            const isRescheduled = newStatus === 'scheduled' && currentJob?.status === 'scheduled' && currentJob?.scheduled_date !== extraData.scheduled_date;

            const { error } = await supabase
                .from('assessments')
                .update({
                    status: newStatus,
                    ...extraData
                })
                .eq('id', jobId)
                .select();

            if (error) throw error;

            // Trigger notification
            if (newStatus === 'scheduled' || newStatus === 'completed') {
                supabase.functions.invoke('send-job-status-notification', {
                    body: {
                        assessmentId: jobId,
                        status: isRescheduled ? 'rescheduled' : newStatus,
                        details: {
                            inspectionDate: extraData.scheduled_date,
                            certificateUrl: extraData.certificate_url,
                            contractorName: profile?.full_name
                        }
                    }
                }).catch(err => console.error('Failed to trigger status notification:', err));
            }

            toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
            setSchedulingJob(null);
            setCompletingJob(null);
            fetchData();
        } catch (error: any) {
            console.error('Error updating status:', error);
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
            <header className="bg-[#0c121d] backdrop-blur-md border-b border-white/5 sticky top-0 z-[9999] shadow-lg transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="relative flex-shrink-0">
                            <img src="/logo.svg" alt="The Berman Logo" className="h-10 w-auto relative z-10" />
                        </Link>
                        <div className="hidden xl:block">
                            <h1 className="text-lg font-bold text-white leading-tight">Assessor Portal</h1>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1.5 uppercase tracking-widest font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                Live Assessment Network
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
                                            { id: 'available', label: 'Available Jobs', icon: Briefcase },
                                            { id: 'my_quotes', label: 'My Quotes', icon: ClipboardList },
                                            { id: 'active', label: 'My Clients', icon: User },
                                            { id: 'settings', label: 'Settings', icon: Settings },
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
                    <div className="px-8 py-10 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-3xl font-black text-gray-900 mb-2">
                                    {view === 'available' ? 'Available Assessment Leads' :
                                        view === 'my_quotes' ? 'My Active Quotes' :
                                            view === 'active' ? 'My Assessment Clients' :
                                                view === 'settings' ? 'Assessor Settings' : 'Dashboard'}
                                </h2>
                                <p className="text-gray-500 font-medium max-w-2xl">
                                    {view === 'available' ? 'Browse and quote for energy assessment leads in your preferred counties.' :
                                        view === 'my_quotes' ? "Track and manage quotes you've submitted to homeowners." :
                                            view === 'active' ? 'Manage your current inspection schedule and client communications.' :
                                                view === 'settings' ? 'Configure your notification preferences and service area.' :
                                                    'Welcome to your professional assessor dashboard.'}
                                </p>
                            </div>
                            {view === 'available' && availableJobs.length > 0 && (
                                <div className="flex items-center gap-2 bg-[#007EA7]/10 text-[#007EA7] px-4 py-2 rounded-xl border border-[#007EA7]/20">
                                    <Briefcase size={16} />
                                    <span className="text-sm font-bold">{availableJobs.length} New Leads Available</span>
                                </div>
                            )}
                        </div>
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
                                                <th className="text-left py-3 px-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Eircode</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sq. Mt.</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Beds</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Heat Pump</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Addition</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Date</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableJobs.map((job, index) => {
                                                const daysSincePosted = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
                                                const isRecent = daysSincePosted <= 2;
                                                return (
                                                    <tr
                                                        key={job.id}
                                                        className={`border-b border-gray-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                    >
                                                        <td className="py-3 px-4 text-gray-600 font-medium">
                                                            {new Date(job.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-900 font-bold">{job.town}</td>
                                                        <td className="py-3 px-4 text-gray-600">{job.county}</td>
                                                        <td className="py-3 px-4 text-blue-600 font-medium">{job.eircode}</td>
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
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 capitalize">
                                                                {job.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-600">
                                                            {job.additional_features?.length > 0 ? job.additional_features.join(', ') : 'None'}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-600">{job.preferred_date || 'Flexible'}</td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedJob(job);
                                                                    handleStartQuote();
                                                                }}
                                                                className={`px-4 py-2 text-white rounded-lg text-xs font-bold transition-all shadow-sm ${isRecent
                                                                    ? 'bg-yellow-500 hover:bg-yellow-600'
                                                                    : 'bg-green-600 hover:bg-green-700'
                                                                    }`}
                                                            >
                                                                Quote
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden space-y-4">
                                        {availableJobs.map(job => (
                                            <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{job.town}, {job.county}</p>
                                                        <p className="text-[10px] text-blue-600 font-bold">{job.eircode}</p>
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
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-blue-600 uppercase tracking-wider">Eircode</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sq. Mt.</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Beds</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Heat Pump</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Addition</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Survey Date</th>
                                                    <td className="text-left py-3 px-3 text-xs font-bold text-gray-900 uppercase tracking-wider">Lowest Quote</td>
                                                    <td className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">My Quote</td>
                                                    <td className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider"></td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myQuotes.map((quote, index) => {
                                                    const isCompetitive = !quote.lowestPrice || quote.price <= quote.lowestPrice;
                                                    return (
                                                        <tr
                                                            key={quote.id}
                                                            className={`border-b border-gray-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                        >
                                                            <td className="py-3 px-3 text-gray-600 font-medium">
                                                                {new Date(quote.assessment?.created_at || quote.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-900 font-bold">{quote.assessment?.town || '-'}</td>
                                                            <td className="py-3 px-3 text-gray-600">{quote.assessment?.county || '-'}</td>
                                                            <td className="py-3 px-3 text-blue-600 font-medium">{quote.assessment?.eircode || '-'}</td>
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
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                    quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {quote.status || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600">
                                                                {quote.assessment?.additional_features?.length ? quote.assessment.additional_features.join(', ') : 'None'}
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600">{quote.assessment?.preferred_date || 'Flexible'}</td>
                                                            <td className="py-3 px-3 text-gray-900 font-bold">€ {quote.lowestPrice?.toLocaleString() || '-'}</td>
                                                            <td className={`py-3 px-3 font-bold ${isCompetitive ? 'text-green-700' : 'text-red-600'}`}>
                                                                €{quote.price.toLocaleString()}
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <button
                                                                    onClick={() => handleReQuote(quote)}
                                                                    disabled={quote.status === 'accepted'}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-bold transition-all"
                                                                >
                                                                    Re-Quote
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {myQuotes.map(quote => (
                                                <div key={quote.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{quote.assessment?.town || '-'}, {quote.assessment?.county || '-'}</p>
                                                            <p className="text-[10px] text-blue-600 font-bold">{quote.assessment?.eircode}</p>
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
                                                        disabled={quote.status === 'accepted'}
                                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        Re-Quote
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : view === 'active' ? (
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
                                        <p className="text-sm text-white/80">Here's your successful quotes on theberman.eu. Please contact <span className="text-yellow-300">your clients</span> within one business day.</p>
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
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Addition</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Survey Date</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeJobs.map((job, index) => (
                                                    <Fragment key={job.id}>
                                                        <tr
                                                            key={job.id}
                                                            className={`border-b border-gray-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                        >
                                                            <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">
                                                                {new Date(job.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-900 font-bold">{job.town}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.county}</td>
                                                            <td className="py-3 px-3">
                                                                <span className="text-blue-600 font-medium">
                                                                    {job.eircode || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600">{job.property_type}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.property_size}</td>
                                                            <td className="py-3 px-3 text-gray-600 font-bold">{job.bedrooms}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.heat_pump || 'None'}</td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${job.ber_purpose?.toLowerCase().includes('mortgage') ? 'bg-blue-100 text-blue-700' :
                                                                    job.ber_purpose?.toLowerCase().includes('grant') ? 'bg-green-100 text-green-700' :
                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {job.ber_purpose || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${job.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                                                    job.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-green-100 text-green-700'
                                                                    }`}>
                                                                    {job.status?.replace('_', ' ') || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${job.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                    'bg-orange-100 text-orange-700'
                                                                    }`}>
                                                                    {job.payment_status || 'Unpaid'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600 text-xs italic">
                                                                {job.additional_features?.length ? job.additional_features.join(', ') : 'None'}
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600 font-bold">
                                                                {job.scheduled_date
                                                                    ? new Date(job.scheduled_date).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })
                                                                    : 'TBD'
                                                                }
                                                            </td>
                                                            <td className="py-3 px-3 flex flex-col gap-1">
                                                                <button
                                                                    onClick={() => setExpandedContactId(expandedContactId === job.id ? null : job.id)}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-black uppercase transition-all whitespace-nowrap"
                                                                >
                                                                    Contact Info
                                                                </button>
                                                                {job.status === 'quote_accepted' && (
                                                                    <button
                                                                        onClick={() => setSchedulingJob(job)}
                                                                        className="px-3 py-1.5 bg-[#007EA7] hover:bg-[#005F7E] text-white rounded text-[10px] font-black uppercase transition-all whitespace-nowrap"
                                                                    >
                                                                        Schedule
                                                                    </button>
                                                                )}
                                                                {job.status === 'scheduled' && (
                                                                    <div className="flex flex-col gap-1">
                                                                        <button
                                                                            onClick={() => setCompletingJob(job)}
                                                                            className="px-3 py-1.5 bg-[#007F00] hover:bg-green-800 text-white rounded text-[10px] font-black uppercase transition-all whitespace-nowrap"
                                                                        >
                                                                            Complete
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setSchedulingJob(job)}
                                                                            className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-[10px] font-black uppercase transition-all whitespace-nowrap"
                                                                        >
                                                                            Reschedule
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-3 text-green-700 font-bold">
                                                                €{job.quotes?.find(q => q.status === 'accepted')?.price?.toLocaleString() || job.quotes?.[0]?.price?.toLocaleString() || '-'}
                                                            </td>

                                                        </tr>
                                                        {/* Expandable Contact Details Row */}
                                                        {expandedContactId === job.id && (
                                                            <tr key={`${job.id}-contact`} className="bg-green-50 border-b border-gray-100">
                                                                <td colSpan={15} className="py-3 px-6">
                                                                    <div className="flex items-center gap-6 text-sm">
                                                                        <span className="text-gray-400">↳</span>
                                                                        <span><strong>Name:</strong> {job.contact_name || job.profiles?.full_name || 'N/A'}</span>
                                                                        <span><strong>Email:</strong> <a href={`mailto:${job.contact_email}`} className="text-blue-600 hover:underline">{job.contact_email || 'N/A'}</a></span>
                                                                        <span><strong>Phone:</strong> <a href={`tel:${job.contact_phone}`} className="text-blue-600 hover:underline">{job.contact_phone || 'N/A'}</a></span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="md:hidden space-y-4">
                                            {activeJobs.map(job => (
                                                <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                    Accepted {new Date(job.created_at).toLocaleDateString()}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${job.status === 'completed' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                                    job.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                        'bg-green-50 text-green-700 border-green-100'
                                                                    }`}>
                                                                    {job.status?.replace('_', ' ') || '-'}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-bold text-gray-900">{job.property_address}</h4>
                                                            <p className="text-xs text-gray-500">{job.town}, {job.county}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-green-700">
                                                                €{job.quotes?.find(q => q.status === 'accepted')?.price?.toLocaleString() || job.quotes?.[0]?.price?.toLocaleString() || '-'}
                                                            </p>
                                                            <p className="text-[10px] font-extrabold text-orange-600 uppercase">
                                                                {job.payment_status || 'Unpaid'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2">
                                                        <button
                                                            onClick={() => setExpandedContactId(expandedContactId === job.id ? null : job.id)}
                                                            className="w-full py-3 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all uppercase tracking-tight"
                                                        >
                                                            {expandedContactId === job.id ? 'Close Contact Details' : 'View Contact Details'}
                                                        </button>

                                                        {job.status === 'quote_accepted' && (
                                                            <button
                                                                onClick={() => setSchedulingJob(job)}
                                                                className="w-full py-3 bg-[#007EA7] text-white rounded-xl font-black text-xs hover:bg-[#005F7E] transition-all uppercase tracking-tight shadow-md shadow-blue-50"
                                                            >
                                                                Schedule Inspection
                                                            </button>
                                                        )}

                                                        {job.status === 'scheduled' && (
                                                            <>
                                                                <button
                                                                    onClick={() => setCompletingJob(job)}
                                                                    className="w-full py-3 bg-[#007F00] text-white rounded-xl font-black text-xs hover:bg-green-800 transition-all uppercase tracking-tight shadow-md shadow-green-50"
                                                                >
                                                                    Mark Complete
                                                                </button>
                                                                <button
                                                                    onClick={() => setSchedulingJob(job)}
                                                                    className="w-full py-2 bg-gray-500 text-white rounded-xl font-bold text-[10px] hover:bg-gray-600 transition-all uppercase tracking-widest"
                                                                >
                                                                    Reschedule
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Mobile Expandable Contact Info */}
                                                    {expandedContactId === job.id && (
                                                        <div className="mt-4 pt-4 border-t border-gray-50 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">Name:</span>
                                                                <span className="font-bold text-gray-900">{job.contact_name || job.profiles?.full_name || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">Email:</span>
                                                                <a href={`mailto:${job.contact_email}`} className="font-bold text-blue-600 underline">{job.contact_email || 'N/A'}</a>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">Phone:</span>
                                                                <a href={`tel:${job.contact_phone}`} className="font-bold text-blue-600 underline">{job.contact_phone || 'N/A'}</a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : view === 'settings' ? (
                            <div className="animate-in fade-in duration-700 bg-gray-100 min-h-screen pb-20">
                                {/* SMS Notifications Banner */}
                                <div className="bg-[#E6F4EA] border-b border-gray-200 py-12 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <h2 className="text-xl font-medium text-green-800">SMS Notifications</h2>
                                        <MessageCircle className="text-green-800 fill-green-800" size={24} />
                                    </div>
                                    <p className="text-sm text-green-700">
                                        You are currently receiving job notifications by SMS to <span className="font-bold underline">{profile?.phone}</span>.
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase
                                                    .from('profiles')
                                                    .update({ sms_notifications_enabled: !profile?.sms_notifications_enabled })
                                                    .eq('id', user?.id);
                                                if (error) toast.error('Failed to update notifications');
                                                else {
                                                    setProfile({ ...profile, sms_notifications_enabled: !profile?.sms_notifications_enabled });
                                                    toast.success('Notification settings updated');
                                                }
                                            }}
                                            className="ml-1 underline hover:text-green-900"
                                        >
                                            {profile?.sms_notifications_enabled ? 'Cancel SMS Notifications' : 'Enable SMS Notifications'}
                                        </button>
                                    </p>
                                </div>

                                {/* County Preferences */}
                                <div className="py-12 px-4 text-center">
                                    <h3 className="text-gray-600 font-medium mb-8 flex items-center justify-center gap-2 text-lg">
                                        Select Your County Lead Preferences <MapPin className="text-gray-700 fill-gray-700" size={24} />
                                    </h3>
                                    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 px-4">
                                        {COUNTIES.map(county => {
                                            const isSelected = profile?.preferred_counties?.includes(county) || profile?.home_county === county;
                                            return (
                                                <button
                                                    key={county}
                                                    onClick={async () => {
                                                        const current = profile?.preferred_counties || (profile?.home_county ? [profile.home_county] : []);
                                                        let newCounties;
                                                        if (current.includes(county)) {
                                                            newCounties = current.filter((c: string) => c !== county);
                                                        } else {
                                                            newCounties = [...current, county];
                                                        }

                                                        // Update local state first for immediate UI response
                                                        const newHomeCounty = newCounties[0] || '';
                                                        setProfile({ ...profile, preferred_counties: newCounties, home_county: newHomeCounty });

                                                        // Auto-save to database
                                                        try {
                                                            const { error } = await supabase
                                                                .from('profiles')
                                                                .update({
                                                                    preferred_counties: newCounties,
                                                                    home_county: newHomeCounty
                                                                })
                                                                .eq('id', user?.id);

                                                            if (error) throw error;
                                                            toast.success(`${county} preference updated`, {
                                                                duration: 2000,
                                                                icon: '📍',
                                                                style: {
                                                                    borderRadius: '10px',
                                                                    background: '#333',
                                                                    color: '#fff',
                                                                },
                                                            });
                                                        } catch (err) {
                                                            console.error('Auto-save error:', err);
                                                            toast.error('Failed to auto-save preference');
                                                        }
                                                    }}
                                                    className={`py-3 px-6 rounded-md border transition-all text-sm font-medium ${isSelected
                                                        ? 'bg-[#5CB85C] border-[#5CB85C] text-white shadow-sm'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {county}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* My Profile Separator */}
                                <div className="border-t border-white mb-8"></div>

                                {/* My Profile Form */}
                                <div className="max-w-3xl mx-auto px-4 text-center">
                                    <h3 className="text-gray-600 font-medium mb-8 flex items-center justify-center gap-2 text-lg">
                                        My Profile <div className="bg-gray-700 rounded-full p-1"><Settings className="text-white w-4 h-4" /></div>
                                    </h3>

                                    <div className="space-y-6 text-left">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">About Me</label>
                                            <p className="text-[10px] text-gray-500 mb-2 ml-1">The information you submit below is displayed in the 'About' section of your BER assessor profile on the website (max 200 words).</p>
                                            <textarea
                                                value={profile?.about_me || ''}
                                                onChange={(e) => setProfile({ ...profile, about_me: e.target.value })}
                                                className="w-full min-h-[120px] p-4 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                                            />
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                0/200 words
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">Website URL</label>
                                            <input
                                                type="url"
                                                value={profile?.website_url || ''}
                                                onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                                                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Must start with www., http://, https://, http://www., or https://www.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">Company Name</label>
                                            <input
                                                type="text"
                                                value={profile?.company_name || ''}
                                                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                                                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            />
                                        </div>

                                        <div className="flex justify-center gap-4 pt-8 pb-12">
                                            <button
                                                onClick={async () => {
                                                    const { error } = await supabase
                                                        .from('profiles')
                                                        .update({
                                                            about_me: profile.about_me,
                                                            company_name: profile.company_name,
                                                            website_url: profile.website_url,
                                                            // Save preferred_counties if the column exists, otherwise this might fail silently or error
                                                            // We'll also save home_county as the first preferred county for backward compatibility
                                                            home_county: profile.home_county,
                                                            preferred_counties: profile.preferred_counties
                                                        })
                                                        .eq('id', user?.id);

                                                    if (error) {
                                                        console.error('Update error:', error);
                                                        toast.error('Failed to save changes. Check console for details.');
                                                    } else {
                                                        toast.success('Profile updated successfully');
                                                    }
                                                }}
                                                className="px-8 py-2 bg-[#007BFF] text-white rounded font-medium hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Submit
                                            </button>
                                            <Link
                                                to={`/profiles/${user?.id}`}
                                                target="_blank"
                                                className="px-8 py-2 bg-[#5CB85C] text-white rounded font-medium hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                                            >
                                                View Profile <User size={14} className="fill-white" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main >

            {/* Job Details Modal - STEP 1 */}
            {
                jobDetailsModalOpen && selectedJob && (
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
                )
            }

            {/* Quote Modal - DATE PICKER + QUOTE FORM */}
            {
                quoteModalOpen && selectedJob && (
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
                                        {myQuotes.find(q => q.assessment_id === selectedJob.id) && (
                                            <p className="text-sm font-medium text-green-700 mb-4 bg-green-50 py-2 px-4 rounded-full inline-block">
                                                Your previous quote was <span className="underline font-bold">€{myQuotes.find(q => q.assessment_id === selectedJob.id)?.price}</span>
                                            </p>
                                        )}
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
                                                    onClick={() => {
                                                        setSelectedAvailabilityDate(dateStr);
                                                        setQuoteStep(2);
                                                    }}
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
                                        {(() => {
                                            const previousQuote = myQuotes.find(q => q.assessment_id === selectedJob.id);
                                            return previousQuote ? (
                                                <p className="text-sm font-medium text-green-700">
                                                    Your previous quote was <span className="underline font-bold">€{previousQuote.price}</span>
                                                </p>
                                            ) : (
                                                <p className="text-sm text-green-600">Submit your quote below.</p>
                                            );
                                        })()}
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
                                                        I agree to the <a href="/assessor-terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">terms of use</a>
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
                )
            }

            {/* Rejection Modal */}
            {
                rejectionModalOpen && selectedJob && (
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
                )
            }
            {/* Scheduling Modal */}
            {
                schedulingJob && (
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
                )
            }

            {/* Completion Modal */}
            {
                completingJob && (
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
                                    onClick={() => handleUpdateStatus(completingJob.id, 'completed', { certificate_url: certUrl, completed_at: new Date().toISOString() })}
                                    disabled={isSubmitting || !certUrl}
                                    className="w-full bg-[#007F00] text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Completing...' : 'Submit & Complete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


        </div >
    );
};

export default ContractorDashboard;
