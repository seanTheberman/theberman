import React, { useMemo, useState } from 'react';
import { Search, MapPin, Calendar, Clock, User, Mail, Phone, FileText, DollarSign, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Building2, Home } from 'lucide-react';
import type { Assessment, Quote } from '../../../types/admin';

interface Props {
    assessments: Assessment[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    locationFilter: string;
    setLocationFilter: (location: string) => void;
    onAssessmentClick: (assessment: Assessment) => void;
    loading?: boolean;
}

interface JobCardProps {
    assessment: Assessment;
    onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ assessment, onClick }) => {
    const [showQuotes, setShowQuotes] = useState(false);
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-700';
            case 'submitted': return 'bg-blue-100 text-blue-700';
            case 'pending': case 'pending_quote': return 'bg-yellow-100 text-yellow-700';
            case 'quote_accepted': return 'bg-green-100 text-green-700';
            case 'scheduled': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'assigned': return 'bg-indigo-100 text-indigo-700';
            case 'live': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return <FileText size={16} />;
            case 'submitted': return <AlertCircle size={16} />;
            case 'pending': case 'pending_quote': return <Clock size={16} />;
            case 'quote_accepted': return <CheckCircle size={16} />;
            case 'scheduled': return <Calendar size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            case 'assigned': return <User size={16} />;
            case 'live': return <Building2 size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const getQuoteStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IE', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const hasQuotes = assessment.quotes && assessment.quotes.length > 0;
    const pendingQuotes = assessment.quotes?.filter((q: Quote) => q.status === 'pending') || [];
    const acceptedQuotes = assessment.quotes?.filter((q: Quote) => q.status === 'accepted') || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{assessment.property_address}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} />
                            <span>{assessment.town || 'N/A'}, {assessment.county || 'N/A'}</span>
                            {assessment.property_type && (
                                <>
                                    <span>•</span>
                                    <Home size={14} />
                                    <span>{assessment.property_type}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                        {getStatusIcon(assessment.status)}
                        <span className="capitalize">{assessment.status.replace('_', ' ')}</span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{assessment.user?.full_name || 'Unknown'}</span>
                    </div>
                    {assessment.contact_email && (
                        <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{assessment.contact_email}</span>
                        </div>
                    )}
                    {assessment.contact_phone && (
                        <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{assessment.contact_phone}</span>
                        </div>
                    )}
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                        <span className="text-gray-500 block">Job Type</span>
                        <span className="font-medium capitalize">{assessment.job_type || 'Domestic'}</span>
                    </div>
                    {assessment.bedrooms && (
                        <div>
                            <span className="text-gray-500 block">Bedrooms</span>
                            <span className="font-medium">{assessment.bedrooms}</span>
                        </div>
                    )}
                    {assessment.property_size && (
                        <div>
                            <span className="text-gray-500 block">Size</span>
                            <span className="font-medium">{assessment.property_size}</span>
                        </div>
                    )}
                    <div>
                        <span className="text-gray-500 block">Created</span>
                        <span className="font-medium">{formatDate(assessment.created_at)}</span>
                    </div>
                </div>

                {/* Quotes Section */}
                <div className="border-t pt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowQuotes(!showQuotes);
                        }}
                        className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-gray-600" />
                            <span className="font-medium text-gray-900">Quotes</span>
                            <span className="text-sm text-gray-600">
                                ({hasQuotes ? assessment.quotes?.length : 0} total)
                            </span>
                            {pendingQuotes.length > 0 && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                    {pendingQuotes.length} pending
                                </span>
                            )}
                            {acceptedQuotes.length > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {acceptedQuotes.length} accepted
                                </span>
                            )}
                        </div>
                        {showQuotes ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {showQuotes && hasQuotes && (
                        <div className="mt-3 space-y-2">
                            {assessment.quotes?.map((quote: Quote) => (
                                <div key={quote.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {quote.contractor?.company_name || quote.contractor?.full_name || 'Unknown Contractor'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {quote.contractor?.email}
                                                {quote.contractor?.phone && ` • ${quote.contractor.phone}`}
                                            </div>
                                            {quote.contractor?.seai_number && (
                                                <div className="text-xs text-gray-500">SEAI: {quote.contractor.seai_number}</div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getQuoteStatusColor(quote.status)}`}>
                                                {quote.status}
                                            </div>
                                            <div className="font-semibold text-gray-900 mt-1">
                                                {formatPrice(quote.price)}
                                            </div>
                                        </div>
                                    </div>
                                    {quote.notes && (
                                        <div className="text-sm text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
                                            <strong>Notes:</strong> {quote.notes}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                        Submitted: {formatDate(quote.created_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showQuotes && !hasQuotes && (
                        <div className="mt-3 text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                            <DollarSign size={24} className="mx-auto mb-2 opacity-50" />
                            <p>No quotes submitted yet for this job</p>
                        </div>
                    )}
                </div>

                {/* Preferred Date */}
                {assessment.preferred_date && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>Preferred: {assessment.preferred_date} {assessment.preferred_time && `at ${assessment.preferred_time}`}</span>
                    </div>
                )}

                {/* Scheduled Date */}
                {assessment.scheduled_date && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                        <Calendar size={14} />
                        <span>Scheduled: {formatDate(assessment.scheduled_date)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const JobsView: React.FC<Props> = ({
    assessments,
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    onAssessmentClick,
    loading = false
}) => {
    // Get unique counties from assessments
    const uniqueCounties = useMemo(() => {
        const counties = new Set<string>();
        assessments.forEach(a => {
            if (a.county) counties.add(a.county);
        });
        return Array.from(counties).sort();
    }, [assessments]);

    // Filter assessments based on search and location
    const filteredAssessments = useMemo(() => {
        return assessments.filter(assessment => {
            const query = searchTerm.toLowerCase();
            const matchSearch = 
                assessment.property_address?.toLowerCase().includes(query) ||
                assessment.town?.toLowerCase().includes(query) ||
                assessment.county?.toLowerCase().includes(query) ||
                assessment.status?.toLowerCase().includes(query) ||
                (assessment.user?.full_name || '').toLowerCase().includes(query) ||
                (assessment.contact_email || '').toLowerCase().includes(query) ||
                (assessment.contact_phone || '').toLowerCase().includes(query);
            
            const matchLocation = !locationFilter || assessment.county === locationFilter;
            
            return matchSearch && matchLocation;
        });
    }, [assessments, searchTerm, locationFilter]);

    // Job statistics
    const jobStats = useMemo(() => ({
        total: assessments.length,
        pending: assessments.filter(a => a.status === 'pending' || a.status === 'pending_quote').length,
        scheduled: assessments.filter(a => a.status === 'scheduled').length,
        completed: assessments.filter(a => a.status === 'completed').length,
        withQuotes: assessments.filter(a => a.quotes && a.quotes.length > 0).length,
        pendingQuotes: assessments.reduce((count, a) => count + (a.quotes?.filter((q: Quote) => q.status === 'pending').length || 0), 0)
    }), [assessments]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007F00]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Jobs Management</h1>
                <p className="text-gray-600">Manage and track all assessment jobs and quote submissions</p>
                
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{jobStats.total}</div>
                        <div className="text-sm text-gray-600">Total Jobs</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{jobStats.pending}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{jobStats.scheduled}</div>
                        <div className="text-sm text-gray-600">Scheduled</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{jobStats.completed}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{jobStats.withQuotes}</div>
                        <div className="text-sm text-gray-600">With Quotes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{jobStats.pendingQuotes}</div>
                        <div className="text-sm text-gray-600">Pending Quotes</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search jobs by address, customer, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none appearance-none bg-white"
                        >
                            <option value="">All Counties</option>
                            {uniqueCounties.map(county => (
                                <option key={county} value={county}>{county}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {searchTerm || locationFilter ? (
                    <div className="mt-3 text-sm text-gray-600">
                        Showing {filteredAssessments.length} of {assessments.length} jobs
                    </div>
                ) : null}
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
                {filteredAssessments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="text-gray-400 mb-2">
                            <Search size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
                        <p className="text-gray-600">
                            {searchTerm || locationFilter 
                                ? 'Try adjusting your search filters' 
                                : 'No jobs have been created yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredAssessments.map(assessment => (
                            <JobCard
                                key={assessment.id}
                                assessment={assessment}
                                onClick={() => onAssessmentClick(assessment)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
