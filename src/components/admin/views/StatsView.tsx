import { useState } from 'react';
import { Home, ClipboardList, Building, DollarSign, Briefcase, TrendingUp, ArrowRight, Hourglass, CheckCircle2, Users, Search, AlertTriangle, Edit2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Filter as FilterIcon } from 'lucide-react';
import type { Profile, Assessment, Payment, AdminView } from '../../../types/admin';
import { ProfileStatusBadge, PaymentStatusBadge } from '../StatusBadges';
import { formatLastLogin } from '../adminUtils';
import { Zap } from 'lucide-react';

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
    handleOpenCatalogueView: (business: Profile | null, existingListing?: any) => void;
    setSelectedUser: (u: Profile | null) => void;
    setItemToSuspend: (item: { id: string; name: string; currentStatus: boolean } | null) => void;
    setShowSuspendModal: (v: boolean) => void;
    handleDeleteClick: (id: string, type: 'lead' | 'sponsor' | 'assessment' | 'user') => void;
    setView: (v: AdminView) => void;
}

type StatSubView = 'homeowners' | 'assessors' | 'businesses' | 'payments' | 'assessments' | 'leads' | null;

export const StatsView = ({
    stats, users_list, listings, assessments, payments,
    searchTerm, setSearchTerm, locationFilter, setLocationFilter, uniqueUserLocations,
    handleOpenCatalogueView, setSelectedUser, setItemToSuspend, setShowSuspendModal, handleDeleteClick, setView,
}: Props) => {
    const [selectedStatView, setSelectedStatView] = useState<StatSubView>('homeowners');

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* LEFT COLUMN: Stacked Users Breakdown */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    <button
                        onClick={() => setSelectedStatView('homeowners')}
                        className={`w-full bg-white p-4 rounded-xl border-2 text-left hover:shadow-md transition-all relative overflow-hidden group ${selectedStatView === 'homeowners' ? 'border-green-300 shadow-green-100/50 shadow-lg' : 'border-green-100'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="bg-[#4b5563] text-white text-[11px] font-bold px-3 py-1.5 rounded-full inline-block">Homeowners</div>
                            <Home size={22} strokeWidth={2} className="text-green-500" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-2 mt-2">
                            <h3 className="text-4xl font-black text-gray-900">{stats.homeowners}</h3>
                            <span className="text-sm font-medium text-gray-400">{stats.totalUsers > 0 ? Math.round((stats.homeowners / stats.totalUsers) * 100) : 0}% of {stats.totalUsers}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-[6px] rounded-full bg-green-50 overflow-hidden">
                                <div className="bg-green-500 h-full transition-all rounded-full" style={{ width: `${stats.totalUsers > 0 ? (stats.homeowners / stats.totalUsers) * 100 : 0}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium w-8 text-right">{stats.homeowners}/{stats.totalUsers}</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedStatView('assessors')}
                        className={`w-full bg-white p-4 rounded-xl border-2 text-left hover:shadow-md transition-all relative overflow-hidden group ${selectedStatView === 'assessors' ? 'border-blue-300 shadow-blue-100/50 shadow-lg' : 'border-blue-100'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="bg-[#4b5563] text-white text-[11px] font-bold px-3 py-1.5 rounded-full inline-block">Assessors</div>
                            <ClipboardList size={22} strokeWidth={2} className="text-blue-500" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-2 mt-2">
                            <h3 className="text-4xl font-black text-gray-900">{stats.contractors}</h3>
                            <span className="text-sm font-medium text-gray-400">{stats.totalUsers > 0 ? Math.round((stats.contractors / stats.totalUsers) * 100) : 0}% of {stats.totalUsers}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-[6px] rounded-full bg-blue-50 overflow-hidden">
                                <div className="bg-blue-500 h-full transition-all rounded-full" style={{ width: `${stats.totalUsers > 0 ? (stats.contractors / stats.totalUsers) * 100 : 0}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium w-8 text-right">{stats.contractors}/{stats.totalUsers}</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedStatView('businesses')}
                        className={`w-full bg-white p-4 rounded-xl border-2 text-left hover:shadow-md transition-all relative overflow-hidden group ${selectedStatView === 'businesses' ? 'border-purple-300 shadow-purple-100/50 shadow-lg' : 'border-purple-100'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="bg-[#4b5563] text-white text-[11px] font-bold px-3 py-1.5 rounded-full inline-block">Businesses</div>
                            <Building size={22} strokeWidth={2} className="text-purple-500" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-2 mt-2">
                            <h3 className="text-4xl font-black text-gray-900">{stats.businessLeads}</h3>
                            <span className="text-sm font-medium text-gray-400">{stats.totalUsers > 0 ? Math.round((stats.businessLeads / stats.totalUsers) * 100) : 0}% of {stats.totalUsers}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-[6px] rounded-full bg-purple-50 overflow-hidden">
                                <div className="bg-[#a855f7] h-full transition-all rounded-full" style={{ width: `${stats.totalUsers > 0 ? (stats.businessLeads / stats.totalUsers) * 100 : 0}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium w-8 text-right">{stats.businessLeads}/{stats.totalUsers}</span>
                        </div>
                    </button>
                </div>

                {/* RIGHT COLUMN: 2x2 Grid */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => setView('payments')}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left hover:border-green-300 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-80"></div>
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-gray-500">Total Revenue</p>
                                <div className="w-7 h-7 rounded-md bg-green-50 flex items-center justify-center">
                                    <DollarSign size={14} className="text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-gray-1000 tracking-tight mt-1 mb-4">
                                {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
                            </h3>
                        </div>
                        <div>
                            <div className="inline-flex items-center px-2.5 py-1 rounded bg-green-50 border border-green-100">
                                <span className="text-[11px] font-bold text-green-700">$ {payments.filter(p => p.status === 'completed').length} Payments</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setView('assessments')}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-80"></div>
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-gray-500">Active Jobs</p>
                                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
                                    <Briefcase size={14} className="text-blue-600" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-gray-1000 tracking-tight mt-1 mb-4">{stats.activeAssessments}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 border border-blue-100">
                                <span className="text-[11px] font-bold text-blue-700">{stats.pendingQuotes} Pending</span>
                            </div>
                            <div className="inline-flex items-center px-2.5 py-1 rounded bg-green-50 border border-green-100">
                                <span className="text-[11px] font-bold text-green-700">Done {stats.completedAssessments}</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setView('leads')}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left hover:border-teal-300 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 opacity-80"></div>
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-gray-500">Conversion</p>
                                <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-teal-600" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-gray-1000 tracking-tight mt-1 mb-4">
                                {stats.totalLeads > 0 ? Math.round((stats.acceptedQuotes / stats.totalLeads) * 100) : 0}%
                            </h3>
                        </div>
                        <div>
                            <div className="inline-flex items-center px-2.5 py-1 rounded bg-teal-50 border border-teal-100 gap-1.5">
                                <ArrowRight size={12} className="text-teal-600" />
                                <span className="text-[11px] font-bold text-teal-700">{stats.acceptedQuotes} of {stats.totalLeads} Leads</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setView('businesses')}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left hover:border-amber-300 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 opacity-80"></div>
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-gray-500">Business Leads</p>
                                <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center">
                                    <ClipboardList size={14} className="text-amber-600" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-gray-1000 tracking-tight mt-1 mb-4">{stats.businessLeads}</h3>
                        </div>
                        <div>
                            {stats.pendingOnboarding > 0 ? (
                                <div className="inline-flex items-center px-2.5 py-1 rounded bg-amber-50 border border-amber-200 gap-1.5">
                                    <Hourglass size={12} className="text-amber-600" />
                                    <span className="text-[11px] font-bold text-amber-700">{stats.pendingOnboarding} Pending Onboarding</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-2.5 py-1 rounded bg-green-50 border border-green-100 gap-1.5">
                                    <CheckCircle2 size={12} className="text-green-600" />
                                    <span className="text-[11px] font-bold text-green-700">All Onboarded</span>
                                </div>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {selectedStatView === 'homeowners' || selectedStatView === 'assessors' || selectedStatView === 'businesses' ? (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative w-full sm:w-48">
                                <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all text-sm appearance-none bg-white font-medium text-gray-700"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                >
                                    <option value="">All Locations</option>
                                    {uniqueUserLocations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 font-medium hidden sm:block">
                            Showing {users_list.filter(u => {
                                const matchRole = selectedStatView === 'assessors' ? u.role === 'contractor' : selectedStatView === 'businesses' ? u.role === 'business' : (u.role === 'user' || u.role === 'homeowner');
                                const matchSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchLocation = !locationFilter || u.county === locationFilter || u.home_county === locationFilter;
                                return matchRole && matchSearch && matchLocation;
                            }).length} users
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Details</th>
                                        <th className="px-6 py-4">Sign-Up Date</th>
                                        {selectedStatView !== 'businesses' && <th className="px-6 py-4">Activity</th>}
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(() => {
                                        const filtered = users_list.filter(u => {
                                            const matchRole = selectedStatView === 'assessors' ? u.role === 'contractor' : selectedStatView === 'businesses' ? u.role === 'business' : (u.role === 'user' || u.role === 'homeowner');
                                            const matchSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchLocation = !locationFilter || u.county === locationFilter || u.home_county === locationFilter;
                                            return matchRole && matchSearch && matchLocation;
                                        });

                                        if (filtered.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={selectedStatView === 'businesses' ? 4 : 5} className="px-6 py-12 text-center text-gray-400 italic">No users found.</td>
                                                </tr>
                                            );
                                        }

                                        return filtered.map((u) => {
                                            const listing = listings.find(l => l.user_id === u.id || l.owner_id === u.id);
                                            const hasListing = !!listing;

                                            return (
                                                <tr key={u.id} className="hover:bg-green-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            <ProfileStatusBadge profile={u} />
                                                            <div className="flex flex-col gap-0.5 ml-1">
                                                                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                                                                    <Zap size={10} className={u.last_login ? 'text-blue-500' : 'text-gray-300'} />
                                                                    <span>Login: {formatLastLogin(u.last_login)}</span>
                                                                </div>
                                                                {(u.role === 'contractor' || u.role === 'business') && (
                                                                    <div className={`flex items-center gap-1 text-[9px] font-bold uppercase ${u.subscription_status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                                                                        {u.subscription_status === 'active' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                                                        <span>Sub: {u.subscription_status || 'None'}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <PaymentStatusBadge profile={u} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {u.full_name}
                                                        <div className="text-xs text-gray-400 font-normal">{u.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </td>
                                                    {selectedStatView !== 'businesses' && (
                                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                                            {u.role === 'contractor' ? (
                                                                <div className="flex items-center gap-1 text-blue-600">
                                                                    <Briefcase size={14} />
                                                                    <span>{assessments.filter(a => a.contractor_id === u.id).length} Jobs</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-green-600">
                                                                    <Home size={14} />
                                                                    <span>{assessments.filter(a => a.user_id === u.id).length} Requests</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {u.role === 'contractor' && (
                                                                hasListing ? (
                                                                    <button onClick={() => handleOpenCatalogueView(u, listing)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Catalogue Listing"><Edit2 size={16} /></button>
                                                                ) : (
                                                                    <button onClick={() => handleOpenCatalogueView(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Add to Catalogue"><Plus size={16} /></button>
                                                                )
                                                            )}
                                                            <button onClick={() => setSelectedUser(u)} className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all" title="View/Edit User Details"><Pencil size={16} /></button>
                                                            <button
                                                                onClick={() => { setItemToSuspend({ id: u.id, name: u.full_name, currentStatus: u.is_active !== false }); setShowSuspendModal(true); }}
                                                                className={`p-2 rounded-lg transition-all ${u.is_active !== false ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
                                                                title={u.is_active !== false ? 'Suspend User' : 'Activate User'}
                                                            ><AlertTriangle size={16} /></button>
                                                            <button onClick={() => handleDeleteClick(u.id, 'user')} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all" title="Delete User"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : selectedStatView === 'payments' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Recent Revenue</h3>
                    </div>
                </div>
            ) : selectedStatView === 'assessments' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Active Jobs</h3>
                    </div>
                </div>
            ) : selectedStatView === 'leads' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Recent Conversions</h3>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Select a user type above</h3>
                    <p className="text-sm text-gray-400">Click Homeowners, Assessors, or Businesses to view details.</p>
                </div>
            )}
        </div>
    );
};
