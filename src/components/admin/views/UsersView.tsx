import { Search, TrendingUp, Briefcase, Home, Eye, AlertTriangle, Trash2, RefreshCw, Mail, XCircle, Edit2, Plus, Zap, CheckCircle2 } from 'lucide-react';
import { Filter as FilterIcon } from 'lucide-react';
import type { Profile, Assessment, AdminView } from '../../../types/admin';
import { ProfileStatusBadge, PaymentStatusBadge } from '../StatusBadges';
import { formatLastLogin } from '../adminUtils';

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
    handleManualRenewal: (userId: string, months: number) => void;
    handleSendRenewalReminder: (u: any) => void;
    handleCancelSubscription: (userId: string) => void;
    handleOpenCatalogueView: (business: Profile | null, existingListing?: any) => void;
    setSelectedUser: (u: Profile | null) => void;
    setItemToSuspend: (item: { id: string; name: string; currentStatus: boolean } | null) => void;
    setShowSuspendModal: (v: boolean) => void;
    handleDeleteClick: (id: string, type: 'lead' | 'sponsor' | 'assessment' | 'user') => void;
    setNewUserRole: (role: 'contractor' | 'business') => void;
    setShowAddUserModal: (v: boolean) => void;
}

export const UsersView = ({
    view, users_list, assessments, listings,
    searchTerm, setSearchTerm, locationFilter, setLocationFilter, uniqueUserLocations,
    isUpdating,
    handleManualRenewal, handleSendRenewalReminder, handleCancelSubscription,
    handleOpenCatalogueView, setSelectedUser, setItemToSuspend, setShowSuspendModal,
    handleDeleteClick, setNewUserRole, setShowAddUserModal,
}: Props) => {
    const filteredUsers = users_list.filter(u => {
        const matchRole = view === 'assessors' ? u.role === 'contractor' : (u.role === 'user' || u.role === 'homeowner');
        const query = searchTerm.toLowerCase();
        const matchSearch = u.full_name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.company_name?.toLowerCase().includes(query) ||
            u.business_address?.toLowerCase().includes(query) ||
            u.county?.toLowerCase().includes(query) ||
            u.town?.toLowerCase().includes(query);
        const matchLocation = !locationFilter || u.county === locationFilter || u.home_county === locationFilter;
        return matchRole && matchSearch && matchLocation;
    });

    return (
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
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {view === 'assessors' && (
                        <button
                            onClick={() => { setNewUserRole('contractor'); setShowAddUserModal(true); }}
                            className="flex items-center gap-2 bg-[#007F00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-sm whitespace-nowrap"
                        >
                            <TrendingUp size={16} />
                            Add BER Assessor
                        </button>
                    )}
                    <div className="text-xs text-gray-400 font-medium hidden sm:block">
                        Showing {filteredUsers.length} users
                    </div>
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
                                <th className="px-6 py-4">Activity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
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
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {u.role === 'contractor' && (
                                                        <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-lg border border-gray-100 mr-2">
                                                            <button onClick={() => handleManualRenewal(u.id, 12)} disabled={isUpdating} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all" title="Manual Renew (1 Year)"><RefreshCw size={14} /></button>
                                                            <button onClick={() => handleSendRenewalReminder(u)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-all" title="Send Renewal Reminder"><Mail size={14} /></button>
                                                            {u.subscription_status === 'active' && (
                                                                <button onClick={() => handleCancelSubscription(u.id)} disabled={isUpdating} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all" title="Cancel Subscription"><XCircle size={14} /></button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {u.role === 'contractor' && (
                                                        hasListing ? (
                                                            <button onClick={() => handleOpenCatalogueView(u, listing)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Catalogue Listing"><Edit2 size={16} /></button>
                                                        ) : (
                                                            <button onClick={() => handleOpenCatalogueView(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Add to Catalogue"><Plus size={16} /></button>
                                                        )
                                                    )}
                                                    <button onClick={() => setSelectedUser(u)} className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all" title="View User Details"><Eye size={16} /></button>
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
