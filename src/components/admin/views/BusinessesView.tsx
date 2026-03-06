import { Search, Briefcase, AlertTriangle, CheckCircle2, Mail, Pencil, Plus, Eye, RefreshCw, XCircle, X, Trash2, Zap } from 'lucide-react';
import { Filter as FilterIcon } from 'lucide-react';
import type { Profile } from '../../../types/admin';
import { ProfileStatusBadge, PaymentStatusBadge, SubscriptionInfo } from '../StatusBadges';
import { formatLastLogin } from '../adminUtils';

interface Props {
    filteredBusinessLeads: Profile[];
    users_list: Profile[];
    listings: any[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    locationFilter: string;
    setLocationFilter: (v: string) => void;
    uniqueUserLocations: string[];
    isUpdating: boolean;
    sendingEmailId: string | null;
    handleManualRenewal: (userId: string, months: number) => void;
    handleSendRenewalReminder: (u: any) => void;
    handleCancelSubscription: (userId: string) => void;
    handleSendOnboardingEmail: (u: any) => void;
    handleOpenCatalogueView: (business: Profile | null, existingListing?: any) => void;
    setSelectedUser: (u: Profile | null) => void;
    setEditForm: (form: any) => void;
    setItemToSuspend: (item: { id: string; name: string; currentStatus: boolean } | null) => void;
    setShowSuspendModal: (v: boolean) => void;
    updateRegistrationStatus: (userId: string, status: 'active' | 'rejected') => void;
    handleDeleteClick: (id: string, type: 'lead' | 'sponsor' | 'assessment' | 'user') => void;
    setNewUserRole: (role: 'contractor' | 'business') => void;
    setShowAddUserModal: (v: boolean) => void;
}

export const BusinessesView = ({
    filteredBusinessLeads, users_list, listings,
    searchTerm, setSearchTerm, locationFilter, setLocationFilter, uniqueUserLocations,
    isUpdating, sendingEmailId,
    handleManualRenewal, handleSendRenewalReminder, handleCancelSubscription,
    handleSendOnboardingEmail, handleOpenCatalogueView,
    setSelectedUser, setEditForm, setItemToSuspend, setShowSuspendModal,
    updateRegistrationStatus, handleDeleteClick,
    setNewUserRole, setShowAddUserModal,
}: Props) => (
    <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by business name or email..."
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
                        <option value="">All Counties</option>
                        {uniqueUserLocations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                    onClick={() => { setNewUserRole('business'); setShowAddUserModal(true); }}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                >
                    <Briefcase size={16} />
                    Add Business
                </button>
                <div className="text-xs text-gray-400 font-medium hidden sm:block">
                    {filteredBusinessLeads.length} of {users_list.filter(u => u.role === 'business').length} businesses
                    {locationFilter && <span className="text-[#007F00] font-bold ml-1">in {locationFilter}</span>}
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Business Details</th>
                            <th className="px-6 py-4">Signup Date</th>
                            <th className="px-6 py-4">Subscription</th>
                            <th className="px-6 py-4">Registration</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredBusinessLeads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                    No businesses found{locationFilter ? ` in ${locationFilter}` : ''}.
                                </td>
                            </tr>
                        ) : (
                            filteredBusinessLeads.map((u) => {
                                const listing = listings.find(l => l.user_id === u.id || l.owner_id === u.id);
                                const hasListing = !!listing;
                                const isPending = u.registration_status === 'pending';
                                const isActive = u.registration_status === 'active';

                                return (
                                    <tr key={u.id} className={`hover:bg-green-50/30 transition-colors group ${isPending ? 'bg-amber-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <ProfileStatusBadge profile={u} />
                                                <div className="flex flex-col gap-0.5 ml-1">
                                                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                                                        <Zap size={10} className={u.last_login ? 'text-blue-500' : 'text-gray-300'} />
                                                        <span>Login: {formatLastLogin(u.last_login)}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-[9px] font-bold uppercase ${u.subscription_status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {u.subscription_status === 'active' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                                        <span>Sub: {u.subscription_status || 'Inactive'}</span>
                                                    </div>
                                                </div>
                                                <PaymentStatusBadge profile={u} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{u.company_name || u.full_name}</div>
                                            {u.company_name && <div className="text-xs text-gray-500">{u.full_name}</div>}
                                            <div className="text-xs text-gray-400">{u.email}</div>
                                            {u.county && <div className="text-[10px] text-gray-400 mt-0.5">📍 Co. {u.county}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(u.created_at).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <SubscriptionInfo profile={u} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.stripe_payment_id === 'SUSPENDED' ? (
                                                <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                                                    <AlertTriangle size={14} /> Suspended
                                                </div>
                                            ) : isPending ? (
                                                // Pending: needs admin review first
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit">
                                                        ⏳ Awaiting Review
                                                    </span>
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => updateRegistrationStatus(u.id, 'active')}
                                                            disabled={isUpdating}
                                                            className="flex items-center gap-1 bg-white border border-green-300 text-green-700 hover:bg-green-50 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 size={12} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateRegistrationStatus(u.id, 'rejected')}
                                                            disabled={isUpdating}
                                                            className="flex items-center gap-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
                                                        >
                                                            <X size={12} /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : isActive && hasListing ? (
                                                // Active + has listing = Registration Complete
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                                                        <CheckCircle2 size={14} /> Registration Complete
                                                    </div>
                                                    <button onClick={() => handleOpenCatalogueView(u, listing)} className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1">
                                                        <Pencil size={12} /> Edit Catalogue
                                                    </button>
                                                </div>
                                            ) : isActive && !hasListing ? (
                                                // Active but no catalogue listing yet
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleSendOnboardingEmail(u)}
                                                        disabled={sendingEmailId === u.id}
                                                        className="flex items-center gap-1.5 bg-[#007F00] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 w-fit"
                                                    >
                                                        {sendingEmailId === u.id ? (
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        ) : (
                                                            <><Mail size={14} /> Send Form</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenCatalogueView(u)}
                                                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm w-fit"
                                                    >
                                                        <Plus size={14} /> Add to Catalogue
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-red-500 font-bold">Rejected</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="flex items-center gap-0.5 bg-gray-50 p-1 rounded-lg border border-gray-100">
                                                    <button onClick={() => handleManualRenewal(u.id, 12)} disabled={isUpdating} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all" title="Grant 12-month subscription"><RefreshCw size={13} /></button>
                                                    <button onClick={() => handleSendRenewalReminder(u)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-all" title="Send Renewal Reminder"><Mail size={13} /></button>
                                                    {u.subscription_status === 'active' && (
                                                        <button onClick={() => handleCancelSubscription(u.id)} disabled={isUpdating} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all" title="Cancel Subscription"><XCircle size={13} /></button>
                                                    )}
                                                </div>
                                                <button
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
                                                    className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all"
                                                    title="View/Edit Profile"
                                                ><Eye size={15} /></button>
                                                <button
                                                    onClick={() => { setItemToSuspend({ id: u.id, name: u.company_name || u.full_name, currentStatus: u.is_active !== false }); setShowSuspendModal(true); }}
                                                    className={`p-2 rounded-lg transition-all ${u.is_active !== false ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
                                                    title={u.is_active !== false ? 'Suspend' : 'Activate'}
                                                ><AlertTriangle size={15} /></button>
                                                <button onClick={() => handleDeleteClick(u.id, 'user')} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all" title="Delete Business"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
