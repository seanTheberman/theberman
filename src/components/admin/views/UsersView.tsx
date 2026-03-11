import { useState } from 'react';
import { Search, TrendingUp, Briefcase, Home, Eye, AlertTriangle, Mail, Edit2, Plus, CheckCircle2, X, Trash2 } from 'lucide-react';
import { Filter as FilterIcon } from 'lucide-react';
import type { Profile, Assessment, AdminView } from '../../../types/admin';
import { StatusCell, PaymentStatusBadge } from '../StatusBadges';

interface Props {
    view: AdminView;
    users_list: Profile[];
    assessments: Assessment[];
    listings: any[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    locationFilter: string;
    setLocationFilter: (v: string) => void;
    uniqueUserLocations: string[];
    isUpdating: boolean;
    handleSendRenewalReminder: (u: any) => void;
    handleOpenCatalogueView: (business: Profile | null, existingListing?: any) => void;
    updateRegistrationStatus: (userId: string, status: 'active' | 'rejected') => void;
    setSelectedUser: (u: Profile | null) => void;
    setItemToSuspend: (item: { id: string; name: string; currentStatus: boolean } | null) => void;
    setShowSuspendModal: (v: boolean) => void;
    setNewUserRole: (role: 'contractor' | 'business') => void;
    setShowAddUserModal: (v: boolean) => void;
    handleDeleteClick: (id: string, type: 'lead' | 'sponsor' | 'assessment' | 'user') => void;
}


export const UsersView = ({
    view, users_list, assessments, listings,
    searchTerm, setSearchTerm, locationFilter, setLocationFilter, uniqueUserLocations,
    isUpdating,
    handleSendRenewalReminder,
    handleOpenCatalogueView, updateRegistrationStatus, setSelectedUser, setItemToSuspend, setShowSuspendModal,
    setNewUserRole, setShowAddUserModal, handleDeleteClick,
}: Props) => {
    const isAssessors = view === 'assessors';
    const [typeFilter, setTypeFilter] = useState('');

    const filtered = users_list.filter(u => {
        const matchRole = isAssessors ? u.role === 'contractor' : (u.role === 'user' || u.role === 'homeowner');
        const q = searchTerm.toLowerCase();
        const matchSearch = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) ||
            u.seai_number?.toLowerCase().includes(q) || u.home_county?.toLowerCase().includes(q);
        const matchLoc = !locationFilter || (isAssessors ? 
            (u.home_county === locationFilter || u.county === locationFilter || u.preferred_counties?.includes(locationFilter)) : 
            (u.county === locationFilter || u.home_county === locationFilter));
        const matchType = !typeFilter || !isAssessors || (u.assessor_type?.toLowerCase() === typeFilter.toLowerCase());
        return matchRole && matchSearch && matchLoc && matchType;
    });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                        <input
                            type="text"
                            placeholder={isAssessors ? 'Name, email, SEAI #...' : 'Name or email...'}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-gray-50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:w-44">
                        <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                        <select
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-gray-50 appearance-none text-gray-600"
                            value={locationFilter}
                            onChange={e => setLocationFilter(e.target.value)}
                        >
                            <option value="">All Counties ({users_list.filter(u => isAssessors ? u.role === 'contractor' : (u.role === 'user' || u.role === 'homeowner')).length})</option>
                            {uniqueUserLocations.map(loc => {
                                const count = users_list.filter(u => {
                                    const matchRole = isAssessors ? u.role === 'contractor' : (u.role === 'user' || u.role === 'homeowner');
                                    const matchLoc = isAssessors ? 
                                        (u.home_county === loc || u.county === loc || u.preferred_counties?.includes(loc)) : 
                                        (u.county === loc || u.home_county === loc);
                                    return matchRole && matchLoc;
                                }).length;
                                return <option key={loc} value={loc}>{loc} ({count})</option>;
                            })}
                        </select>
                    </div>
                    {isAssessors && (
                        <div className="relative w-full sm:w-40">
                            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                            <select
                                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-gray-50 appearance-none text-gray-600"
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="domestic">Domestic ({users_list.filter(u => u.role === 'contractor' && u.assessor_type?.toLowerCase() === 'domestic').length})</option>
                                <option value="commercial">Commercial ({users_list.filter(u => u.role === 'contractor' && u.assessor_type?.toLowerCase() === 'commercial').length})</option>
                                <option value="both">Both ({users_list.filter(u => u.role === 'contractor' && u.assessor_type?.toLowerCase() === 'both').length})</option>
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {isAssessors && (
                        <button
                            onClick={() => { setNewUserRole('contractor'); setShowAddUserModal(true); }}
                            className="flex items-center gap-2 bg-[#007F00] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all shadow-sm"
                        >
                            <TrendingUp size={14} /> Add Assessor
                        </button>
                    )}
                    <span className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}{locationFilter && ` · ${locationFilter}`}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isAssessors ? 'Assessor' : 'User'}</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Activity</th>
                            {isAssessors && <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>}
                            {isAssessors && <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approval</th>}
                            <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={isAssessors ? 7 : 5} className="px-5 py-12 text-center text-gray-300 text-sm italic">
                                No {isAssessors ? 'assessors' : 'users'} found{locationFilter ? ` in ${locationFilter}` : ''}.
                            </td></tr>
                        ) : filtered.map(u => {
                            const listing = listings.find(l => l.user_id === u.id || l.owner_id === u.id);
                            const isPending = u.registration_status === 'pending';
                            const jobCount = isAssessors
                                ? assessments.filter(a => a.contractor_id === u.id).length
                                : assessments.filter(a => a.user_id === u.id).length;

                            return (
                                <tr key={u.id} className={`hover:bg-gray-50/60 transition-colors ${isPending ? 'bg-amber-50/20' : ''}`}>

                                    {/* Status */}
                                    <td className="px-5 py-3">
                                        <StatusCell profile={u} />
                                    </td>

                                    {/* Details */}
                                    <td className="px-5 py-3">
                                        <div className="font-semibold text-gray-800 text-[13px] leading-tight">{u.full_name || u.email}</div>
                                        {!isAssessors && u.full_name && <div className="text-[11px] text-gray-400 mt-0.5">{u.email}</div>}
                                        {isAssessors && u.home_county && (
                                            <div className="text-[10px] text-gray-400 mt-0.5" title={u.preferred_counties?.join(', ')}>
                                                Co. {u.home_county}
                                                {u.preferred_counties && u.preferred_counties.length > 0 && ` (+${u.preferred_counties.filter(c => c !== u.home_county).length})`}
                                            </div>
                                        )}
                                        {isAssessors && u.assessor_type && (
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                u.assessor_type.toLowerCase() === 'commercial'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : u.assessor_type.toLowerCase() === 'both'
                                                    ? 'bg-purple-50 text-purple-600'
                                                    : 'bg-green-50 text-green-700'
                                            }`}>
                                                {u.assessor_type}
                                            </span>
                                        )}
                                    </td>

                                    {/* Joined */}
                                    <td className="px-5 py-3 text-[12px] text-gray-400 whitespace-nowrap">
                                        {new Date(u.created_at).toLocaleDateString('en-GB')}
                                    </td>

                                    {/* Activity */}
                                    <td className="px-5 py-3">
                                        <div className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${jobCount > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                            {isAssessors ? <Briefcase size={13} /> : <Home size={13} />}
                                            {jobCount} {isAssessors ? 'job' : 'request'}{jobCount !== 1 ? 's' : ''}
                                        </div>
                                    </td>

                                    {/* Payment (assessors only) */}
                                    {isAssessors && (
                                        <td className="px-5 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <PaymentStatusBadge profile={u} />
                                                {u.subscription_end_date && (
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(u.subscription_end_date) < new Date()
                                                            ? <span className="text-red-400">Expired</span>
                                                            : `Until ${new Date(u.subscription_end_date).toLocaleDateString('en-GB')}`}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    )}

                                    {/* Approval (assessors only) */}
                                    {isAssessors && (
                                        <td className="px-5 py-3">
                                            {isPending ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => updateRegistrationStatus(u.id, 'active')}
                                                        disabled={isUpdating}
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
                                                    ><CheckCircle2 size={11} /> Approve</button>
                                                    <button
                                                        onClick={() => updateRegistrationStatus(u.id, 'rejected')}
                                                        disabled={isUpdating}
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
                                                    ><X size={11} /> Reject</button>
                                                </div>
                                            ) : u.registration_status === 'active' ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 size={11} /> Active</span>
                                                    {listing ? (
                                                        <button onClick={() => handleOpenCatalogueView(u, listing)} className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1">
                                                            <Edit2 size={10} /> Edit Listing
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleOpenCatalogueView(u)} className="text-[10px] text-green-600 hover:text-green-700 flex items-center gap-1">
                                                            <Plus size={10} /> Add to Catalogue
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-red-500 font-semibold">Rejected</span>
                                            )}
                                        </td>
                                    )}

                                    {/* Actions */}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Reminder only for assessors without active subscription */}
                                            {u.role === 'contractor' && u.subscription_status !== 'active' && (
                                                <button onClick={() => handleSendRenewalReminder(u)} title="Send subscription reminder" className="p-1.5 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Mail size={14} /></button>
                                            )}
                                            <button onClick={() => setSelectedUser(u)} title="View details" className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"><Eye size={14} /></button>
                                            <button
                                                onClick={() => { setItemToSuspend({ id: u.id, name: u.full_name, currentStatus: u.is_active !== false }); setShowSuspendModal(true); }}
                                                title={u.is_active !== false ? 'Suspend' : 'Activate'}
                                                className={`p-1.5 rounded-lg transition-all ${u.is_active !== false ? 'text-gray-300 hover:text-amber-500 hover:bg-amber-50' : 'text-green-400 hover:bg-green-50'}`}
                                            ><AlertTriangle size={14} /></button>
                                            <button
                                                onClick={() => handleDeleteClick(u.id, 'user')}
                                                title="Delete user"
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            ><Trash2 size={14} /></button>
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
