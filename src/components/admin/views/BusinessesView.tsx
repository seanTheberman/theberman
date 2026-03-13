import React from 'react';
import { Search, Briefcase, AlertTriangle, CheckCircle2, Mail, Pencil, Plus, Eye, RefreshCw, XCircle, X } from 'lucide-react';
import { Filter as FilterIcon } from 'lucide-react';
import type { Profile, CatalogueListing } from '../../../types/admin';
import { StatusCell, SubscriptionInfo } from '../StatusBadges';

interface Props {
    filteredBusinessLeads: Profile[];
    users_list: Profile[];
    listings: CatalogueListing[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    locationFilter: string;
    setLocationFilter: (v: string) => void;
    uniqueUserLocations: string[];
    isUpdating: boolean;
    sendingEmailId: string | null;
    handleManualRenewal: (userId: string, months: number) => void;
    handleSendRenewalReminder: (u: Profile) => void;
    handleCancelSubscription: (userId: string) => void;
    handleSendOnboardingEmail: (u: Profile) => void;
    handleOpenCatalogueView: (u: Profile | null, listing?: CatalogueListing) => void;
    setSelectedUser: (u: Profile | null) => void;
    setEditForm: (form: Partial<Profile>) => void;
    setItemToSuspend: (u: { id: string; name: string; currentStatus: boolean } | null) => void;
    setShowSuspendModal: (v: boolean) => void;
    updateRegistrationStatus: (id: string, status: 'active' | 'rejected') => void;
    setNewUserRole: (v: 'business') => void;
    setShowAddUserModal: (v: boolean) => void;
}

export const BusinessesView = React.memo(({
    filteredBusinessLeads, users_list, listings,
    searchTerm, setSearchTerm, locationFilter, setLocationFilter, uniqueUserLocations,
    isUpdating, sendingEmailId,
    handleManualRenewal, handleSendRenewalReminder, handleCancelSubscription,
    handleSendOnboardingEmail, handleOpenCatalogueView,
    setSelectedUser, setEditForm, setItemToSuspend, setShowSuspendModal,
    updateRegistrationStatus,
    setNewUserRole, setShowAddUserModal,
}: Props) => (
    <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                    <input
                        type="text"
                        placeholder="Business name, email..."
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
                        <option value="">All Counties</option>
                        {uniqueUserLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => { setNewUserRole('business'); setShowAddUserModal(true); }}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
                >
                    <Briefcase size={14} /> Add Business
                </button>
                <span className="text-xs text-gray-400">
                    {filteredBusinessLeads.length} / {users_list.filter(u => u.role === 'business').length}
                    {locationFilter && ` · ${locationFilter}`}
                </span>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Business</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subscription</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registration</th>
                            <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredBusinessLeads.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-300 text-sm italic">
                                No businesses found{locationFilter ? ` in ${locationFilter}` : ''}.
                            </td></tr>
                        ) : filteredBusinessLeads.map(u => {
                            const listing = listings.find(l => l.user_id === u.id || l.owner_id === u.id);
                            const isPending = u.registration_status === 'pending';
                            const isActive = u.registration_status === 'active';

                            return (
                                <tr
                                    key={u.id}
                                    onClick={() => {
                                        setSelectedUser(u);
                                        setEditForm({
                                            role: u.role,
                                            subscription_status: u.subscription_status || 'inactive',
                                            subscription_start_date: u.subscription_start_date || '',
                                            subscription_end_date: u.subscription_end_date || '',
                                            manual_override_reason: u.manual_override_reason || '',
                                            stripe_payment_id: u.stripe_payment_id || ''
                                        });
                                    }}
                                    className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${isPending ? 'bg-amber-50/20' : ''}`}
                                >

                                    {/* Status */}
                                    <td className="px-5 py-3">
                                        <StatusCell profile={u} />
                                    </td>

                                    {/* Business Details */}
                                    <td className="px-5 py-3">
                                        <div className="font-semibold text-gray-800 text-[13px] leading-tight">{u.company_name || u.full_name}</div>
                                        {u.company_name && <div className="text-[11px] text-gray-500 mt-0.5">{u.full_name}</div>}
                                        <div className="text-[11px] text-gray-400">{u.email}</div>
                                        {u.county && <div className="text-[10px] text-gray-300 mt-0.5">Co. {u.county}</div>}
                                    </td>

                                    {/* Joined */}
                                    <td className="px-5 py-3 text-[12px] text-gray-400 whitespace-nowrap">
                                        {new Date(u.created_at).toLocaleDateString('en-GB')}
                                    </td>

                                    {/* Subscription */}
                                    <td className="px-5 py-3">
                                        <SubscriptionInfo profile={u} />
                                    </td>

                                    {/* Registration */}
                                    <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                                        {u.stripe_payment_id === 'SUSPENDED' ? (
                                            <span className="text-xs font-semibold text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> Suspended</span>
                                        ) : isPending ? (
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit">⏳ Awaiting Review</span>
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => updateRegistrationStatus(u.id, 'active')} disabled={isUpdating}
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                                                        <CheckCircle2 size={11} /> Approve
                                                    </button>
                                                    <button onClick={() => updateRegistrationStatus(u.id, 'rejected')} disabled={isUpdating}
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                                                        <X size={11} /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ) : isActive && listing ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 size={11} /> Complete</span>
                                                <button onClick={() => handleOpenCatalogueView(u, listing)} className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1">
                                                    <Pencil size={10} /> Edit Listing
                                                </button>
                                            </div>
                                        ) : isActive && !listing ? (
                                            <div className="flex gap-1.5 flex-wrap">
                                                <button onClick={() => handleSendOnboardingEmail(u)} disabled={sendingEmailId === u.id}
                                                    className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                                                    {sendingEmailId === u.id
                                                        ? <div className="w-3 h-3 border-2 border-green-300 border-t-green-700 rounded-full animate-spin" />
                                                        : <><Mail size={11} /> Send Form</>}
                                                </button>
                                                <button onClick={() => handleOpenCatalogueView(u)}
                                                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all">
                                                    <Plus size={11} /> Add Listing
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-red-500 font-semibold">Rejected</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded-lg p-1 mr-1">
                                                <button onClick={() => handleManualRenewal(u.id, 12)} disabled={isUpdating} title="Grant 12-month subscription" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-all"><RefreshCw size={12} /></button>
                                                <button onClick={() => handleSendRenewalReminder(u)} title="Send renewal reminder" className="p-1.5 text-amber-500 hover:bg-amber-50 rounded transition-all"><Mail size={12} /></button>
                                                {u.subscription_status === 'active' && (
                                                    <button onClick={() => handleCancelSubscription(u.id)} disabled={isUpdating} title="Cancel subscription" className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"><XCircle size={12} /></button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => { setSelectedUser(u); setEditForm({ role: u.role, subscription_status: u.subscription_status || 'inactive', subscription_start_date: u.subscription_start_date || '', subscription_end_date: u.subscription_end_date || '', manual_override_reason: u.manual_override_reason || '', stripe_payment_id: u.stripe_payment_id || '' }); }}
                                                title="View/Edit" className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={14} /></button>
                                            <button
                                                onClick={() => { setItemToSuspend({ id: u.id, name: u.company_name || u.full_name, currentStatus: u.is_active !== false }); setShowSuspendModal(true); }}
                                                title={u.is_active !== false ? 'Suspend' : 'Activate'}
                                                className={`p-1.5 rounded-lg transition-all ${u.is_active !== false ? 'text-gray-300 hover:text-amber-500 hover:bg-amber-50' : 'text-green-400 hover:bg-green-50'}`}
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
));
