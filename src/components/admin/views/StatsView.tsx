import { useState } from 'react';
import { Home, ClipboardList, Building2, DollarSign, Briefcase, TrendingUp, ArrowRight, Hourglass, CheckCircle2, AlertTriangle, Edit2, Plus, Eye, MapPin, Users } from 'lucide-react';
import { Search } from 'lucide-react';
import type { Profile, Assessment, Payment, AdminView } from '../../../types/admin';
import { StatusCell, PaymentStatusBadge } from '../StatusBadges';

interface Stats {
    totalUsers: number;
    homeowners: number;
    contractors: number;
    totalLeads: number;
    totalRevenue: number;
    activeAssessments: number;
    completedAssessments: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    businessLeads: number;
    pendingOnboarding: number;
}

interface Props {
    stats: Stats;
    users_list: Profile[];
    listings: any[];
    assessments: Assessment[];
    payments: Payment[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    locationFilter: string;
    setLocationFilter: (v: string) => void;
    uniqueUserLocations: string[];
    uniqueAssessorLocations: string[];
    uniqueBusinessLocations: string[];
    handleOpenCatalogueView: (business: Profile | null, existingListing?: any) => void;
    setSelectedUser: (u: Profile | null) => void;
    setItemToSuspend: (item: { id: string; name: string; currentStatus: boolean } | null) => void;
    setShowSuspendModal: (v: boolean) => void;
    setView: (v: AdminView) => void;
}

type UserType = 'all' | 'homeowners' | 'assessors' | 'businesses';

const ROLE_BADGE: Record<string, string> = {
    user: 'bg-gray-100 text-gray-600',
    homeowner: 'bg-green-100 text-green-700',
    contractor: 'bg-blue-100 text-blue-700',
    business: 'bg-purple-100 text-purple-700',
};

const TYPE_TABS: { id: UserType; label: string; icon: React.ElementType; color: string; activeColor: string; count: (s: Stats, total: number) => number }[] = [
    { id: 'all', label: 'All Users', icon: Users, color: 'text-gray-600 border-gray-200 bg-gray-50', activeColor: 'bg-gray-800 text-white border-gray-800', count: (_, total) => total },
    { id: 'homeowners', label: 'Homeowners', icon: Home, color: 'text-green-600 border-green-200 bg-green-50', activeColor: 'bg-green-600 text-white border-green-600', count: s => s.homeowners },
    { id: 'assessors', label: 'Assessors', icon: ClipboardList, color: 'text-blue-600 border-blue-200 bg-blue-50', activeColor: 'bg-blue-600 text-white border-blue-600', count: s => s.contractors },
    { id: 'businesses', label: 'Businesses', icon: Building2, color: 'text-purple-600 border-purple-200 bg-purple-50', activeColor: 'bg-purple-600 text-white border-purple-600', count: s => s.businessLeads },
];

export const StatsView = ({
    stats, users_list, listings, assessments, payments,
    searchTerm, setSearchTerm, locationFilter, setLocationFilter,
    uniqueUserLocations, uniqueAssessorLocations, uniqueBusinessLocations,
    handleOpenCatalogueView, setSelectedUser, setItemToSuspend, setShowSuspendModal, setView,
}: Props) => {
    const [userType, setUserType] = useState<UserType>('all');

    const allLocations = Array.from(new Set(users_list.map(u => u.county || u.home_county).filter(Boolean))).sort() as string[];

    const activeLocations =
        userType === 'assessors' ? uniqueAssessorLocations :
        userType === 'businesses' ? uniqueBusinessLocations :
        userType === 'homeowners' ? uniqueUserLocations :
        allLocations;

    const filtered = users_list.filter(u => {
        const matchRole =
            userType === 'all' ? u.role !== 'admin' :
            userType === 'assessors' ? u.role === 'contractor' :
            userType === 'businesses' ? u.role === 'business' :
            (u.role === 'user' || u.role === 'homeowner');
        const q = searchTerm.toLowerCase();
        const matchSearch = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        const matchLocation = !locationFilter || u.county === locationFilter || u.home_county === locationFilter;
        return matchRole && matchSearch && matchLocation;
    });

    const showActivity = userType !== 'businesses';
    const showRole = userType === 'all';
    const showPayment = userType === 'assessors';
    const colCount = showRole ? (showActivity ? 6 : 5) : (showActivity ? (showPayment ? 6 : 5) : 4);

    const switchType = (t: UserType) => { setUserType(t); setLocationFilter(''); setSearchTerm(''); };

    return (
        <div className="space-y-5">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button onClick={() => setView('payments')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left hover:border-green-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Revenue</p>
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <DollarSign size={15} className="text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-1">
                        {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
                    </p>
                    <p className="text-[11px] text-green-600 font-semibold">{payments.filter(p => p.status === 'completed').length} payments</p>
                </button>

                <button onClick={() => setView('assessments')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Jobs</p>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Briefcase size={15} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-1">{stats.activeAssessments}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-blue-600 font-semibold">{stats.pendingQuotes} pending</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-[11px] text-green-600 font-semibold">{stats.completedAssessments} done</span>
                    </div>
                </button>

                <button onClick={() => setView('leads')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left hover:border-teal-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Conversion</p>
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                            <TrendingUp size={15} className="text-teal-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-1">
                        {stats.totalLeads > 0 ? Math.round((stats.acceptedQuotes / stats.totalLeads) * 100) : 0}%
                    </p>
                    <p className="text-[11px] text-teal-600 font-semibold flex items-center gap-1">
                        <ArrowRight size={10} /> {stats.acceptedQuotes} of {stats.totalLeads} leads
                    </p>
                </button>

                <button onClick={() => setView('businesses')} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-left hover:border-amber-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Onboarding</p>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <Hourglass size={15} className="text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-1">{stats.pendingOnboarding}</p>
                    <p className={`text-[11px] font-semibold flex items-center gap-1 ${stats.pendingOnboarding > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {stats.pendingOnboarding > 0 ? <><Hourglass size={10} /> pending review</> : <><CheckCircle2 size={10} /> all onboarded</>}
                    </p>
                </button>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3">
                    {/* Type tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {TYPE_TABS.map(({ id, label, icon: Icon, color, activeColor, count }) => (
                            <button
                                key={id}
                                onClick={() => switchType(id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${userType === id ? activeColor : color + ' hover:opacity-80'}`}
                            >
                                <Icon size={13} />
                                {label}
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${userType === id ? 'bg-white/20' : 'bg-white/60'}`}>
                                    {count(stats, users_list.filter(u => u.role !== 'admin').length)}
                                </span>
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-gray-400 hidden sm:block">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Search + Location */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none bg-gray-50 transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full sm:w-44">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                            <select
                                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none bg-gray-50 appearance-none text-gray-600 transition-all"
                                value={locationFilter}
                                onChange={e => setLocationFilter(e.target.value)}
                            >
                                <option value="">All Counties</option>
                                {activeLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Details</th>
                            {showRole && <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>}
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                            {showActivity && <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Activity</th>}
                            {showPayment && <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>}
                            <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={colCount} className="px-5 py-12 text-center text-gray-300 text-sm italic">
                                    No {userType === 'all' ? 'users' : userType} found{locationFilter ? ` in ${locationFilter}` : ''}.
                                </td>
                            </tr>
                        ) : filtered.map(u => {
                            const listing = listings.find(l => l.user_id === u.id || l.owner_id === u.id);
                            const isContractor = u.role === 'contractor';
                            const jobCount = isContractor
                                ? assessments.filter(a => a.contractor_id === u.id).length
                                : assessments.filter(a => a.user_id === u.id).length;

                            return (
                                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3">
                                        <StatusCell profile={u} />
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="font-semibold text-gray-800 text-[13px] leading-tight">{u.full_name || u.email}</div>
                                        {u.full_name && <div className="text-[11px] text-gray-400 mt-0.5">{u.email}</div>}
                                        {(u.home_county || u.county) && (
                                            <div className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                                <MapPin size={9} /> Co. {u.home_county || u.county}
                                            </div>
                                        )}
                                    </td>
                                    {showRole && (
                                        <td className="px-5 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-500'}`}>
                                                {u.role === 'contractor' ? 'Assessor' : u.role}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-5 py-3 text-[12px] text-gray-400 whitespace-nowrap">
                                        {new Date(u.created_at).toLocaleDateString('en-GB')}
                                    </td>
                                    {showActivity && (
                                        <td className="px-5 py-3">
                                            <div className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${jobCount > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                                {isContractor ? <Briefcase size={13} /> : <Home size={13} />}
                                                {jobCount} {isContractor ? 'job' : 'request'}{jobCount !== 1 ? 's' : ''}
                                            </div>
                                        </td>
                                    )}
                                    {showPayment && (
                                        <td className="px-5 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <PaymentStatusBadge profile={u} />
                                                {u.subscription_end_date && (
                                                    <span className={`text-[10px] ${new Date(u.subscription_end_date) < new Date() ? 'text-red-400' : 'text-gray-400'}`}>
                                                        {new Date(u.subscription_end_date) < new Date() ? 'Expired' : `Until ${new Date(u.subscription_end_date).toLocaleDateString('en-GB')}`}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {(userType === 'assessors' || (userType === 'all' && isContractor)) && (
                                                listing
                                                    ? <button onClick={() => handleOpenCatalogueView(u, listing)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Listing"><Edit2 size={14} /></button>
                                                    : <button onClick={() => handleOpenCatalogueView(u)} className="p-1.5 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Add to Catalogue"><Plus size={14} /></button>
                                            )}
                                            <button onClick={() => setSelectedUser(u)} className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="View details / Change role"><Eye size={14} /></button>
                                            <button
                                                onClick={() => { setItemToSuspend({ id: u.id, name: u.full_name || u.company_name || '', currentStatus: u.is_active !== false }); setShowSuspendModal(true); }}
                                                className={`p-1.5 rounded-lg transition-all ${u.is_active !== false ? 'text-gray-300 hover:text-amber-500 hover:bg-amber-50' : 'text-green-400 hover:bg-green-50'}`}
                                                title={u.is_active !== false ? 'Suspend' : 'Activate'}
                                            ><AlertTriangle size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
};
