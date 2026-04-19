import React, { useMemo, useState } from 'react';
import { Search, MapPin, Clock, FileText, ChevronDown, ChevronRight, X, Briefcase, AlertTriangle, XCircle, Eye } from 'lucide-react';
import type { Assessment } from '../../../types/admin';

interface Props {
    assessments: Assessment[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    locationFilter: string;
    setLocationFilter: (location: string) => void;
    onAssessmentClick: (assessment: Assessment) => void;
    loading?: boolean;
}

type JobTab = 'live' | 'expired' | 'no_buyer_response' | 'no_assessor_quotes' | 'all';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
        day: '2-digit',
        month: 'short',
    });
};

const formatDateFull = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'draft': return { bg: 'bg-gray-100 text-gray-700', label: 'Draft' };
        case 'submitted': return { bg: 'bg-blue-100 text-blue-700', label: 'Submitted' };
        case 'pending': return { bg: 'bg-yellow-100 text-yellow-700', label: 'Pending' };
        case 'pending_quote': return { bg: 'bg-yellow-100 text-yellow-700', label: 'Pending Quote' };
        case 'quote_accepted': return { bg: 'bg-green-100 text-green-700', label: 'Quote Accepted' };
        case 'scheduled': return { bg: 'bg-purple-100 text-purple-700', label: 'Scheduled' };
        case 'completed': return { bg: 'bg-emerald-100 text-emerald-700', label: 'Completed' };
        case 'assigned': return { bg: 'bg-indigo-100 text-indigo-700', label: 'Assigned' };
        case 'live': return { bg: 'bg-orange-100 text-orange-700', label: 'Live' };
        default: return { bg: 'bg-gray-100 text-gray-700', label: status };
    }
};


// Returns the most recent activity date for a job:
// - Latest quote submission
// - Latest quote status change (accepted/rejected quotes are activity)
// - Falls back to job created_at if no other activity
const getLastActivityDate = (job: Assessment): Date => {
    let latest = new Date(job.created_at);

    if (job.quotes && job.quotes.length > 0) {
        for (const q of job.quotes) {
            const quoteDate = new Date(q.created_at);
            if (quoteDate > latest) latest = quoteDate;
        }
        // Accepted/rejected quotes = buyer activity, use that date as activity
        const buyerActedQuotes = job.quotes.filter(q => q.status === 'accepted' || q.status === 'rejected');
        for (const q of buyerActedQuotes) {
            const qDate = new Date(q.created_at);
            if (qDate > latest) latest = qDate;
        }
    }

    // Scheduled/assigned = activity happened
    if (job.scheduled_date) {
        const sd = new Date(job.scheduled_date);
        if (sd > latest) latest = sd;
    }

    return latest;
};

const getDaysSinceLastActivity = (job: Assessment): number => {
    const now = new Date();
    const lastActivity = getLastActivityDate(job);
    return Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
};

const EXPIRY_DAYS = 7;

export const JobsView: React.FC<Props> = ({
    assessments,
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    onAssessmentClick,
    loading = false
}) => {
    const [activeTab, setActiveTab] = useState<JobTab>('live');
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

    const uniqueCounties = useMemo(() => {
        const counties = new Set<string>();
        assessments.forEach(a => {
            if (a.county) counties.add(a.county);
        });
        return Array.from(counties).sort();
    }, [assessments]);

    // Categorize assessments based on 7-day inactivity rule
    // A job expires if there's been no activity for 7 days.
    // Activity = quote submitted, buyer accepted/rejected a quote, job scheduled.
    // If any activity happened, the 7-day timer resets from that activity date.

    const liveJobs = useMemo(() =>
        assessments.filter(a => {
            if (!['live', 'submitted', 'pending_quote'].includes(a.status)) return false;
            // Still active if last activity was within 7 days
            return getDaysSinceLastActivity(a) < EXPIRY_DAYS;
        }),
    [assessments]);

    const expiredJobs = useMemo(() =>
        assessments.filter(a => {
            if (a.status === 'completed') return true;
            // Expired = no activity for 7+ days on a live/submitted/pending_quote job
            if (['live', 'submitted', 'pending_quote'].includes(a.status)) {
                return getDaysSinceLastActivity(a) >= EXPIRY_DAYS;
            }
            return false;
        }),
    [assessments]);

    const noBuyerResponseJobs = useMemo(() =>
        assessments.filter(a => {
            if (!['pending_quote', 'live', 'submitted'].includes(a.status)) return false;
            // Has quotes but buyer hasn't accepted or rejected any
            const hasQuotes = a.quotes && a.quotes.length > 0;
            const buyerActed = a.quotes?.some(q => q.status === 'accepted' || q.status === 'rejected');
            if (!hasQuotes || buyerActed) return false;
            // At least 1 day since last quote was submitted with no buyer response
            const latestQuoteDate = Math.max(...(a.quotes || []).map(q => new Date(q.created_at).getTime()));
            const daysSinceLastQuote = Math.floor((Date.now() - latestQuoteDate) / (1000 * 60 * 60 * 24));
            return daysSinceLastQuote >= 1;
        }),
    [assessments]);

    const noAssessorQuotesJobs = useMemo(() =>
        assessments.filter(a => {
            // Live/submitted jobs with zero quotes
            const noQuotes = !a.quotes || a.quotes.length === 0;
            return noQuotes && ['live', 'submitted', 'pending_quote'].includes(a.status);
        }),
    [assessments]);

    // Get active tab's jobs
    const tabJobs = useMemo(() => {
        switch (activeTab) {
            case 'live': return liveJobs;
            case 'expired': return expiredJobs;
            case 'no_buyer_response': return noBuyerResponseJobs;
            case 'no_assessor_quotes': return noAssessorQuotesJobs;
            case 'all': return assessments;
        }
    }, [activeTab, liveJobs, expiredJobs, noBuyerResponseJobs, noAssessorQuotesJobs, assessments]);

    // Apply search & location filters
    const filteredJobs = useMemo(() => {
        return tabJobs.filter(assessment => {
            const query = searchTerm.toLowerCase();
            const matchSearch =
                assessment.property_address?.toLowerCase().includes(query) ||
                assessment.town?.toLowerCase().includes(query) ||
                assessment.county?.toLowerCase().includes(query) ||
                assessment.status?.toLowerCase().includes(query) ||
                (assessment.user?.full_name || '').toLowerCase().includes(query) ||
                (assessment.contact_email || '').toLowerCase().includes(query) ||
                (assessment.contact_phone || '').toLowerCase().includes(query) ||
                (assessment.eircode || '').toLowerCase().includes(query);

            const matchLocation = !locationFilter || assessment.county === locationFilter;

            return matchSearch && matchLocation;
        });
    }, [tabJobs, searchTerm, locationFilter]);

    // Stats
    const stats = useMemo(() => ({
        live: liveJobs.length,
        expired: expiredJobs.length,
        noBuyerResponse: noBuyerResponseJobs.length,
        noAssessorQuotes: noAssessorQuotesJobs.length,
        total: assessments.length,
        totalQuotes: assessments.reduce((c, a) => c + (a.quotes?.length || 0), 0),
    }), [liveJobs, expiredJobs, noBuyerResponseJobs, noAssessorQuotesJobs, assessments]);

    const tabs: { id: JobTab; label: string; count: number; color: string; icon: React.ReactNode }[] = [
        { id: 'live', label: 'Live Jobs', count: stats.live, color: 'bg-green-500', icon: <Briefcase size={15} /> },
        { id: 'expired', label: 'Expired (7d Idle)', count: stats.expired, color: 'bg-gray-500', icon: <Clock size={15} /> },
        { id: 'no_buyer_response', label: 'No Response from Buyer', count: stats.noBuyerResponse, color: 'bg-amber-500', icon: <AlertTriangle size={15} /> },
        { id: 'no_assessor_quotes', label: 'No Quotes from Assessors', count: stats.noAssessorQuotes, color: 'bg-red-500', icon: <XCircle size={15} /> },
        { id: 'all', label: 'All Jobs', count: stats.total, color: 'bg-blue-500', icon: <FileText size={15} /> },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-50 border-t-[#007F00] rounded-full animate-spin"></div>
                <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Jobs...</p>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-col min-h-[600px]">
            {/* Header Banner - matching assessor panel style */}
            <div className="bg-[#c8e6c9] py-6 px-6 text-center">
                <h2 className="text-2xl font-bold italic text-gray-900 mb-1">Jobs Management</h2>
                <p className="text-sm italic text-gray-800">
                    Manage and track all assessment jobs, quotes, and contractor activity.
                </p>
                {/* Quick Stats Row */}
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="text-center">
                        <div className="text-xl font-black text-gray-900">{stats.total}</div>
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Total</div>
                    </div>
                    <div className="w-px h-8 bg-gray-400/30"></div>
                    <div className="text-center">
                        <div className="text-xl font-black text-green-700">{stats.live}</div>
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Live</div>
                    </div>
                    <div className="w-px h-8 bg-gray-400/30"></div>
                    <div className="text-center">
                        <div className="text-xl font-black text-amber-600">{stats.noBuyerResponse}</div>
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Awaiting Buyer</div>
                    </div>
                    <div className="w-px h-8 bg-gray-400/30"></div>
                    <div className="text-center">
                        <div className="text-xl font-black text-red-600">{stats.noAssessorQuotes}</div>
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">No Quotes</div>
                    </div>
                    <div className="w-px h-8 bg-gray-400/30"></div>
                    <div className="text-center">
                        <div className="text-xl font-black text-blue-600">{stats.totalQuotes}</div>
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Total Quotes</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-white overflow-x-auto">
                <div className="flex">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.08em] border-b-2 transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-[#007F00] text-[#007F00] bg-green-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white ${tab.color}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search & Filters */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-3 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by address, town, county, customer, eircode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#007F00] focus:ring-1 focus:ring-[#007F00]/20"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="relative flex-shrink-0">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-[#007F00] appearance-none cursor-pointer"
                    >
                        <option value="">All Counties</option>
                        {uniqueCounties.map(county => (
                            <option key={county} value={county}>{county}</option>
                        ))}
                    </select>
                </div>
                {(searchTerm || locationFilter) && (
                    <span className="text-xs font-bold text-gray-500">
                        {filteredJobs.length} of {tabJobs.length} jobs
                    </span>
                )}
            </div>

            {/* Table Content */}
            <div className="flex-1">
                {filteredJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                            <Briefcase size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-500 max-w-sm">
                            {searchTerm || locationFilter
                                ? 'Try adjusting your search filters.'
                                : activeTab === 'live' ? 'No live jobs at the moment.'
                                : activeTab === 'expired' ? 'No expired or completed jobs. Jobs expire after 7 days of inactivity.'
                                : activeTab === 'no_buyer_response' ? 'All buyers have responded to their quotes.'
                                : activeTab === 'no_assessor_quotes' ? 'All jobs have received at least one quote.'
                                : 'No jobs have been created yet.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-[13px] border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-300">
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Date<br/><span className="font-bold text-[10px] text-gray-500">Posted</span></th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Status</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Customer</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Town</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">County</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Type</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Sq. Mt.</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Beds</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Purpose</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Quotes</th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Last<br/><span className="font-bold text-[10px] text-gray-500">Activity</span></th>
                                        <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">Idle<br/><span className="font-bold text-[10px] text-gray-500">Days</span></th>
                                        <th className="py-3 px-3 font-bold text-gray-800 whitespace-nowrap text-center">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.map((job, index) => {
                                        const badge = getStatusBadge(job.status);
                                        const quoteCount = job.quotes?.length || 0;
                                        const pendingQuotes = job.quotes?.filter(q => q.status === 'pending').length || 0;
                                        const acceptedQuotes = job.quotes?.filter(q => q.status === 'accepted').length || 0;
                                        const isExpanded = expandedJobId === job.id;
                                        const daysSinceActivity = getDaysSinceLastActivity(job);
                                        const isExpiring = daysSinceActivity >= 5 && daysSinceActivity < EXPIRY_DAYS;
                                        const isExpired = daysSinceActivity >= EXPIRY_DAYS && ['live', 'submitted', 'pending_quote'].includes(job.status);

                                        return (
                                            <React.Fragment key={job.id}>
                                                <tr
                                                    className={`border-b border-gray-200 hover:bg-green-50/40 cursor-pointer transition-colors ${isExpired ? 'opacity-60' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                                                >
                                                    <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                                                        <div>{formatDate(job.created_at)}</div>
                                                        <div className={`text-[10px] font-bold ${isExpired ? 'text-red-500' : isExpiring ? 'text-amber-500' : 'text-gray-400'}`}>
                                                            {daysSinceActivity === 0 ? 'Active today' : `${daysSinceActivity}d idle`}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${badge.bg}`}>
                                                            {badge.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <div className="font-bold text-gray-900 text-sm">{job.user?.full_name || job.contact_name || 'Unknown'}</div>
                                                        <div className="text-[11px] text-gray-500">{job.contact_email || job.user?.email || ''}</div>
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-900 font-medium">{job.town || '-'}</td>
                                                    <td className="py-3 px-3 text-gray-700">{job.county || '-'}</td>
                                                    <td className="py-3 px-3 text-gray-700">
                                                        {job.job_type === 'commercial' ? 'Commercial' : (job.property_type || 'Domestic')}
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-700">{job.property_size || '-'}</td>
                                                    <td className="py-3 px-3 text-gray-700">{job.bedrooms || '-'}</td>
                                                    <td className="py-3 px-3 text-gray-700">{job.ber_purpose || '-'}</td>
                                                    <td className="py-3 px-3">
                                                        {quoteCount === 0 ? (
                                                            <span className="text-red-500 font-bold text-xs">0</span>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-gray-900">{quoteCount}</span>
                                                                {acceptedQuotes > 0 && (
                                                                    <span className="w-2 h-2 rounded-full bg-green-500" title={`${acceptedQuotes} accepted`}></span>
                                                                )}
                                                                {pendingQuotes > 0 && (
                                                                    <span className="w-2 h-2 rounded-full bg-yellow-400" title={`${pendingQuotes} pending`}></span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                                                        {formatDate(getLastActivityDate(job).toISOString())}
                                                    </td>
                                                    <td className="py-3 px-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black ${
                                                            daysSinceActivity >= EXPIRY_DAYS ? 'bg-red-100 text-red-700' :
                                                            daysSinceActivity >= 5 ? 'bg-amber-100 text-amber-700' :
                                                            daysSinceActivity >= 3 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                            {daysSinceActivity === 0 ? 'Today' : `${daysSinceActivity}d`}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onAssessmentClick(job);
                                                            }}
                                                            className="px-3 py-1.5 bg-[#007F00] hover:bg-[#006600] text-white rounded text-xs font-bold transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Row - Inline Detail */}
                                                {isExpanded && (
                                                    <tr className="bg-gray-50">
                                                        <td colSpan={13} className="p-0">
                                                            <div className="border-l-4 border-[#007F00] p-5 space-y-4">
                                                                {/* Top info grid */}
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Property Address</span>
                                                                        <span className="font-medium text-gray-900">{job.property_address || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Eircode</span>
                                                                        <span className="font-medium text-blue-600">{job.eircode || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Heat Pump</span>
                                                                        <span className="font-medium text-gray-900">{job.heat_pump || 'None'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Payment Status</span>
                                                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                                                            job.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                            job.payment_status === 'refunded' ? 'bg-red-100 text-red-700' :
                                                                            'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                            {job.payment_status || 'Unpaid'}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customer Phone</span>
                                                                        <span className="font-medium text-gray-900">{job.contact_phone || job.user?.phone || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Job Type</span>
                                                                        <span className="font-medium text-gray-900 capitalize">{job.job_type || 'Domestic'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Additional Features</span>
                                                                        <span className="font-medium text-gray-900">{job.additional_features?.length ? job.additional_features.join(', ') : 'None'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Scheduled Date</span>
                                                                        <span className="font-medium text-gray-900">{job.scheduled_date ? formatDateFull(job.scheduled_date) : 'Not scheduled'}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Notification Status */}
                                                                {job.job_live_notified_at ? (
                                                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-2">Job Live Notifications</span>
                                                                        <div className="flex items-center gap-3 flex-wrap text-xs">
                                                                            {job.job_live_email_sent ? (
                                                                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 font-bold">✓ Email Sent</span>
                                                                            ) : (
                                                                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 font-bold">✗ Email Not Sent</span>
                                                                            )}
                                                                            {job.job_live_sms_sent ? (
                                                                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 font-bold">✓ SMS Sent</span>
                                                                            ) : (
                                                                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 font-bold">✗ SMS Not Sent</span>
                                                                            )}
                                                                            <span className="text-gray-400 text-[10px]">Notified {formatDate(job.job_live_notified_at)}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Job Live Notifications</span>
                                                                        <span className="text-xs text-gray-400 italic">No notification record — job went live before tracking was enabled.</span>
                                                                    </div>
                                                                )}

                                                                {/* Referral Info */}
                                                                {job.referred_by && (
                                                                    <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Referred By</span>
                                                                        <span className="font-bold text-indigo-700">{job.referred_by.name}</span>
                                                                        {job.referred_by.company_name && <span className="text-indigo-600"> — {job.referred_by.company_name}</span>}
                                                                    </div>
                                                                )}

                                                                {/* Quotes Section */}
                                                                <div>
                                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                                        Quotes Received ({job.quotes?.length || 0})
                                                                    </h4>
                                                                    {(!job.quotes || job.quotes.length === 0) ? (
                                                                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                                                                            <XCircle size={20} className="mx-auto mb-1 text-red-300" />
                                                                            <p className="text-sm text-red-600 font-medium">No quotes submitted yet</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="overflow-x-auto">
                                                                            <table className="w-full text-[12px] border border-gray-200 rounded-lg overflow-hidden">
                                                                                <thead>
                                                                                    <tr className="bg-gray-100">
                                                                                        <th className="text-left py-2 px-3 font-bold text-gray-600">Assessor</th>
                                                                                        <th className="text-left py-2 px-3 font-bold text-gray-600">Company</th>
                                                                                        <th className="text-left py-2 px-3 font-bold text-gray-600">Email</th>
                                                                                        <th className="text-left py-2 px-3 font-bold text-gray-600">Phone</th>
                                                                                        <th className="text-left py-2 px-3 font-bold text-gray-600">SEAI #</th>
                                                                                        <th className="text-left py-2 px-3 font-bold text-gray-600">Price</th>
                                                                                        <th className="text-left py-2 px-3 font-bold text-gray-600">Status</th>
                                                                                        <th className="text-left py-2 px-3 font-bold text-gray-600">Date</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {job.quotes!.map((quote, qi) => (
                                                                                        <tr key={quote.id} className={`border-t border-gray-100 ${qi % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                                                            <td className="py-2 px-3 font-bold text-gray-900">{quote.contractor?.full_name || 'Unknown'}</td>
                                                                                            <td className="py-2 px-3 text-gray-700">{quote.contractor?.company_name || '-'}</td>
                                                                                            <td className="py-2 px-3 text-gray-600">{quote.contractor?.email || '-'}</td>
                                                                                            <td className="py-2 px-3 text-gray-600">{quote.contractor?.phone || '-'}</td>
                                                                                            <td className="py-2 px-3 text-gray-600">{quote.contractor?.seai_number || '-'}</td>
                                                                                            <td className="py-2 px-3 font-black text-gray-900">
                                                                                                {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(quote.price)}
                                                                                            </td>
                                                                                            <td className="py-2 px-3">
                                                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                                                                    quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                                                    quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                                                    'bg-yellow-100 text-yellow-700'
                                                                                                }`}>{quote.status}</span>
                                                                                            </td>
                                                                                            <td className="py-2 px-3 text-gray-500">{formatDate(quote.created_at)}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                            {job.quotes!.some(q => q.notes) && (
                                                                                <div className="mt-2 space-y-1">
                                                                                    {job.quotes!.filter(q => q.notes).map(q => (
                                                                                        <div key={q.id} className="text-[11px] text-gray-500 bg-white border border-gray-100 rounded px-3 py-1.5">
                                                                                            <strong>{q.contractor?.full_name}:</strong> {q.notes}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Action Row */}
                                                                <div className="flex items-center justify-end pt-2 border-t border-gray-200">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onAssessmentClick(job);
                                                                        }}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-[#007F00] hover:bg-[#006600] text-white rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        <Eye size={14} />
                                                                        Open Full Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 p-4">
                            {filteredJobs.map(job => {
                                const badge = getStatusBadge(job.status);
                                const quoteCount = job.quotes?.length || 0;
                                const isExpanded = expandedJobId === job.id;

                                return (
                                    <div key={job.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div
                                            className="p-4 cursor-pointer"
                                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{job.user?.full_name || job.contact_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{job.town}, {job.county}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${badge.bg}`}>
                                                        {badge.label}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(job.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mb-2 text-[11px]">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.property_type || 'Domestic'}</span>
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.ber_purpose || '-'}</span>
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.preferred_date || 'Flexible'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="font-bold text-gray-700">Quotes: {quoteCount}</span>
                                                    {quoteCount > 0 && (
                                                        <span className="text-green-600 font-medium">
                                                            ({job.quotes?.filter(q => q.status === 'accepted').length || 0} accepted)
                                                        </span>
                                                    )}
                                                </div>
                                                {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Address</span>
                                                        <span className="text-gray-900">{job.property_address || '-'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Eircode</span>
                                                        <span className="text-blue-600">{job.eircode || '-'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Email</span>
                                                        <span className="text-gray-900">{job.contact_email || job.user?.email || '-'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Phone</span>
                                                        <span className="text-gray-900">{job.contact_phone || job.user?.phone || '-'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Heat Pump</span>
                                                        <span className="text-gray-900">{job.heat_pump || 'None'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Payment</span>
                                                        <span className={`font-bold ${job.payment_status === 'paid' ? 'text-green-600' : 'text-gray-600'}`}>
                                                            {job.payment_status || 'Unpaid'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Mobile Quote List */}
                                                {job.quotes && job.quotes.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quotes</h5>
                                                        {job.quotes.map(quote => (
                                                            <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="font-bold text-gray-900 text-sm">{quote.contractor?.full_name || 'Unknown'}</span>
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                                        quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                        quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                                    }`}>{quote.status}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {quote.contractor?.company_name && <div>{quote.contractor.company_name}</div>}
                                                                    <div className="font-black text-gray-900 text-sm mt-1">
                                                                        {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(quote.price)}
                                                                    </div>
                                                                    <div className="mt-1">{formatDate(quote.created_at)}</div>
                                                                </div>
                                                                {quote.notes && <p className="text-[11px] text-gray-500 mt-1 italic">{quote.notes}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => onAssessmentClick(job)}
                                                    className="w-full py-2.5 bg-[#007F00] hover:bg-[#006600] text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Eye size={14} />
                                                    Open Full Details
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
