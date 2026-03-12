import { X, CheckCircle2, XCircle, AlertTriangle, Mail, Zap, Loader2, Edit2, MapPin, Phone, Calendar, Clock, Building2, Shield } from 'lucide-react';
import type { Profile } from '../../../types/admin';

interface Props {
    user: Profile;
    currentUser: { id: string; role?: string } | null;
    editForm: Partial<Profile>;
    setEditForm: (form: Partial<Profile>) => void;
    customMonths: number;
    setCustomMonths: (v: number) => void;
    listings: any[];
    isUpdating: boolean;
    onClose: () => void;
    onUpdate: () => void;
    onSuspend: () => void;
    onManualRenewal: (userId: string, months: number) => void;
    onSendRenewalReminder: (u: any) => void;
    onCancelSubscription: (userId: string) => void;
    onOpenCatalogue: (user: Profile, listing?: any) => void;
    onUpdateRegistrationStatus: (userId: string, status: 'active' | 'rejected') => void;
    getFallbackPhone: (profile: Profile) => string;
}

const decodePayment = (pid?: string) => {
    if (!pid) return { label: 'Not Paid', cls: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (pid === 'SUSPENDED') return { label: 'Suspended', cls: 'text-red-600 bg-red-50 border-red-200' };
    if (pid === 'CANCELLED') return { label: 'Cancelled', cls: 'text-red-500 bg-red-50 border-red-200' };
    if (pid === 'MANUAL_BY_ADMIN') return { label: 'Activated by Admin', cls: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { label: 'Stripe Payment', cls: 'text-green-600 bg-green-50 border-green-200' };
};

const getAccountState = (user: Profile) => {
    const isSuspended = user.stripe_payment_id === 'SUSPENDED' || user.is_active === false;
    if (isSuspended && user.registration_status !== 'active') return 'suspended';
    if (user.registration_status === 'pending') return 'pending';
    if (user.registration_status === 'rejected') return 'rejected';
    if (user.registration_status === 'active') return 'active';
    return 'unknown';
};

const InfoCard = ({ label, value, icon, mono = false }: { label: string; value?: string | null; icon?: React.ReactNode; mono?: boolean }) => (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            {icon}<span>{label}</span>
        </p>
        <p className={`text-xs font-semibold text-gray-700 break-all ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
);

export const UserDetailsModal = ({
    user, editForm, setEditForm, customMonths, setCustomMonths,
    listings, isUpdating, onClose, onUpdate, onSuspend,
    onManualRenewal, onSendRenewalReminder, onCancelSubscription, onOpenCatalogue,
    onUpdateRegistrationStatus, getFallbackPhone,
}: Props) => {
    const listing = listings.find(l => l.user_id === user.id || l.owner_id === user.id);
    const accountState = getAccountState(user);
    const paymentInfo = decodePayment(user.stripe_payment_id);
    const endDate = user.subscription_end_date ? new Date(user.subscription_end_date) : null;
    const now = new Date();
    const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / 86400000) : null;
    const isExpired = daysLeft !== null && daysLeft <= 0;
    const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

    const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.slice(0, 2).toUpperCase() || '??';

    const isContractorOrBusiness = user.role === 'contractor' || user.role === 'business';

    return (
        <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#007F00] to-[#005500] flex items-center justify-center text-white font-black text-sm shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-gray-900 truncate">{user.full_name || user.email}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{user.role}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                    {/* Status Banner */}
                    {accountState === 'suspended' && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertTriangle size={17} className="text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-red-700">Account Suspended</p>
                                <p className="text-xs text-red-500 mt-0.5">This account was suspended by an admin. The user cannot access their dashboard.</p>
                            </div>
                        </div>
                    )}
                    {accountState === 'pending' && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <Clock size={17} className="text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-amber-700">Awaiting Approval</p>
                                <p className="text-xs text-amber-600 mt-0.5">Review and approve or reject this account.</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => onUpdateRegistrationStatus(user.id, 'active')} disabled={isUpdating}
                                    className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                                    <CheckCircle2 size={12} /> Approve
                                </button>
                                <button onClick={() => onUpdateRegistrationStatus(user.id, 'rejected')} disabled={isUpdating}
                                    className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                                    <XCircle size={12} /> Reject
                                </button>
                            </div>
                        </div>
                    )}
                    {accountState === 'rejected' && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <XCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-red-700">Registration Rejected</p>
                                <p className="text-xs text-red-500 mt-0.5">You can re-approve this account if the user qualifies or has re-applied.</p>
                            </div>
                            <button onClick={() => onUpdateRegistrationStatus(user.id, 'active')} disabled={isUpdating}
                                className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 shrink-0">
                                <CheckCircle2 size={12} /> Re-Approve
                            </button>
                        </div>
                    )}

                    {/* Profile Details */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Profile Details</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <InfoCard label="Phone" value={getFallbackPhone(user)} icon={<Phone size={11} />} />
                            <InfoCard
                                label="Location"
                                value={(user.home_county || user.county) ? `Co. ${user.home_county || user.county}` : undefined}
                                icon={<MapPin size={11} />}
                            />
                         {user.role === 'contractor' && (
    <div className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <MapPin size={11} />
            <span>Preferred Service Locations</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
            {user.preferred_counties && user.preferred_counties.length > 0 ? (
                user.preferred_counties.map((county) => (
                    <span
                        key={county}
                        className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100 shadow-sm"
                    >
                        Co. {county}
                    </span>
                ))
            ) : (
                <span className="text-xs text-gray-400 italic font-medium">
                    No preferred locations set
                </span>
            )}
        </div>
    </div>
)}
                            <InfoCard label="Member Since" value={new Date(user.created_at).toLocaleDateString('en-GB')} icon={<Calendar size={11} />} />
                            <InfoCard
                                label="Last Login"
                                value={user.last_login ? new Date(user.last_login).toLocaleString('en-GB') : 'Never'}
                                icon={<Clock size={11} />}
                            />
                            {user.role === 'contractor' && user.seai_number && (
                                <InfoCard label="SEAI Number" value={user.seai_number} icon={<Shield size={11} />} />
                            )}
                            {user.role === 'contractor' && user.assessor_type && (
                                <InfoCard label="Assessor Type" value={user.assessor_type} icon={<Shield size={11} />} />
                            )}
                            {user.role === 'business' && user.company_name && (
                                <InfoCard label="Company Name" value={user.company_name} icon={<Building2 size={11} />} />
                            )}
                            {user.role === 'business' && user.company_number && (
                                <InfoCard label="Company No." value={user.company_number} icon={<Building2 size={11} />} />
                            )}
                            {user.role === 'business' && user.vat_number && (
                                <InfoCard label="VAT Number" value={user.vat_number} icon={<Building2 size={11} />} />
                            )}
                            {user.role === 'business' && user.website && (
                                <div className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Website</p>
                                    <p className="text-xs font-semibold text-blue-600 truncate">{user.website}</p>
                                </div>
                            )}
                            <div className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">User ID</p>
                                <p className="text-[10px] font-mono text-gray-500 break-all">{user.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription */}
                    {isContractorOrBusiness && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Subscription</p>
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-4">
                                {/* Info row */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight mb-1">Status</p>
                                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md capitalize ${user.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {user.subscription_status || 'inactive'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight mb-1">Start Date</p>
                                        <p className="text-xs font-semibold text-gray-700">
                                            {user.subscription_start_date ? new Date(user.subscription_start_date).toLocaleDateString('en-GB') : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight mb-1">End Date</p>
                                        <p className={`text-xs font-semibold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-gray-700'}`}>
                                            {endDate
                                                ? `${endDate.toLocaleDateString('en-GB')}${isExpired ? ' · Expired' : isExpiringSoon ? ` (${daysLeft}d left)` : ''}`
                                                : '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment method */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight shrink-0">Payment Method:</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${paymentInfo.cls}`}>
                                        {paymentInfo.label}
                                    </span>
                                    {user.stripe_payment_id && !['SUSPENDED', 'CANCELLED', 'MANUAL_BY_ADMIN'].includes(user.stripe_payment_id) && (
                                        <span className="text-[9px] text-gray-400 font-mono">{user.stripe_payment_id}</span>
                                    )}
                                </div>

                                {user.manual_override_reason && (
                                    <p className="text-xs text-gray-500 italic border-t border-blue-100 pt-3">
                                        Note: "{user.manual_override_reason}"
                                    </p>
                                )}

                                {/* Grant/Extend */}
                                <div className="border-t border-blue-100 pt-3">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Grant / Extend Subscription</p>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {[1, 3, 6, 12].map(m => (
                                            <button key={m} onClick={() => setCustomMonths(m)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${customMonths === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                                                {m === 12 ? '1 Year' : `${m}mo`}
                                            </button>
                                        ))}
                                        <div className="flex items-center gap-1.5 ml-auto">
                                            <span className="text-[10px] text-gray-400 font-bold">Custom:</span>
                                            <input type="number" min="1" max="60" value={customMonths}
                                                onChange={e => setCustomMonths(parseInt(e.target.value) || 1)}
                                                className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-center outline-none focus:ring-2 focus:ring-blue-100" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => onManualRenewal(user.id, customMonths)} disabled={isUpdating}
                                            className="flex-[2] bg-blue-600 text-white text-[11px] font-black py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50">
                                            <Zap size={13} fill="currentColor" />
                                            Grant until {(() => {
                                                const d = new Date(user.subscription_end_date && new Date(user.subscription_end_date) > now ? user.subscription_end_date : now);
                                                d.setMonth(d.getMonth() + customMonths);
                                                return d.toLocaleDateString('en-GB');
                                            })()}
                                        </button>
                                        <button onClick={() => onSendRenewalReminder(user)}
                                            className="flex-1 bg-white border border-amber-300 text-amber-600 text-[10px] font-black py-2 rounded-xl hover:bg-amber-50 transition-all flex items-center justify-center gap-1">
                                            <Mail size={13} /> Remind
                                        </button>
                                    </div>
                                    {user.subscription_status === 'active' && (
                                        <button onClick={() => onCancelSubscription(user.id)} disabled={isUpdating}
                                            className="mt-2 w-full text-[10px] font-bold text-red-500 border border-red-200 bg-red-50 py-2 rounded-xl hover:bg-red-100 transition-all">
                                            Cancel Subscription
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Catalogue (business) */}
                    {user.role === 'business' && (
                        <button onClick={() => { onOpenCatalogue(user, listing); onClose(); }}
                            className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                            <Edit2 size={15} />
                            {listing ? 'Edit Catalogue Listing' : 'Add to Catalogue'}
                        </button>
                    )}

                    {/* Role Change */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Change Account Role</p>
                        <select
                            value={editForm.role}
                            onChange={e => setEditForm({ ...editForm, role: e.target.value as any })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white outline-none font-medium text-gray-700"
                        >
                            <option value="user">User</option>
                            <option value="homeowner">Homeowner</option>
                            <option value="contractor">Assessor / Contractor</option>
                            <option value="business">Business</option>
                        </select>
                    </div>

                    {/* Assessor Type (contractors only) */}
                    {(editForm.role === 'contractor' || user.role === 'contractor') && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Assessor Type</p>
                            <select
                                value={editForm.assessor_type || ''}
                                onChange={e => setEditForm({ ...editForm, assessor_type: e.target.value || undefined })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white outline-none font-medium text-gray-700"
                            >
                                <option value="">— Not Set —</option>
                                <option value="Domestic Assessor">Domestic Assessor</option>
                                <option value="Commercial Assessor">Commercial Assessor</option>
                                <option value="Both">Both (Domestic &amp; Commercial)</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-2 shrink-0 bg-gray-50/50">
                    <button onClick={onSuspend}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl border transition-colors ${accountState === 'suspended' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                        {accountState === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                    </button>
                    <button onClick={onUpdate} disabled={isUpdating}
                        className="flex-[2] py-2.5 bg-[#007F00] text-white font-bold rounded-xl hover:bg-green-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                        {isUpdating && <Loader2 size={15} className="animate-spin" />}
                        Save Changes
                    </button>
                    <button onClick={onClose}
                        className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 text-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
