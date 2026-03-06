import { X, AlertCircle, Loader2, Edit2, Mail, XCircle, Zap } from 'lucide-react';
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
    getFallbackPhone: (profile: Profile) => string;
}

export const UserDetailsModal = ({
    user, currentUser, editForm, setEditForm, customMonths, setCustomMonths,
    listings, isUpdating, onClose, onUpdate, onSuspend,
    onManualRenewal, onSendRenewalReminder, onCancelSubscription, onOpenCatalogue, getFallbackPhone,
}: Props) => {
    const listing = listings.find(l => l.user_id === user.id || l.owner_id === user.id);

    return (
        <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Account Role</p>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white transition-all outline-none font-bold text-gray-900 capitalize"
                                >
                                    <option value="user">User</option>
                                    <option value="homeowner">Homeowner</option>
                                    <option value="contractor">Assessor / Contractor</option>
                                    <option value="business">Business</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                                <p className="text-sm font-bold text-gray-900">{getFallbackPhone(user)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                <p className={`text-sm font-bold capitalize ${user.is_active !== false ? 'text-green-600' : 'text-red-600'}`}>
                                    {user.is_active !== false ? 'Active' : 'Suspended'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 col-span-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Login Date & Time</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {user.last_login ? new Date(user.last_login).toLocaleString('en-GB') : 'Never'}
                                </p>
                            </div>
                        </div>

                        {user.role === 'business' && (
                            <div className="p-1 bg-gradient-to-r from-blue-500 to-[#007EA7] rounded-[1.5rem] shadow-lg shadow-blue-100">
                                <button
                                    onClick={() => { onOpenCatalogue(user, listing); onClose(); }}
                                    className="w-full h-full bg-white text-[#007EA7] hover:bg-transparent hover:text-white py-4 rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-[10px] transition-all flex items-center justify-center gap-3"
                                >
                                    <Edit2 size={16} />
                                    Manage Professional Catalogue
                                </button>
                            </div>
                        )}

                        {(user.role === 'contractor' || user.role === 'business') && (
                            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest">Subscription Management</h4>
                                    {(() => {
                                        const endDate = user.subscription_end_date ? new Date(user.subscription_end_date) : null;
                                        const isExpired = endDate && endDate < new Date();
                                        if (isExpired) return (
                                            <span className="flex items-center gap-1 text-[10px] font-black text-red-600 animate-pulse">
                                                <AlertCircle size={12} />
                                                ACCOUNT DISABLED
                                            </span>
                                        );
                                        return null;
                                    })()}
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Status</p>
                                        <p className="text-sm font-black text-blue-900 capitalize">{user.subscription_status || 'Inactive'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Ends On</p>
                                        <p className="text-sm font-black text-blue-900">
                                            {user.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString('en-GB') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 mt-4">
                                    <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Renewal Duration</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {[1, 3, 6, 12].map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => setCustomMonths(m)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${customMonths === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}
                                                >
                                                    {m === 12 ? '1 Year' : `${m} Month${m > 1 ? 's' : ''}`}
                                                </button>
                                            ))}
                                            <div className="flex items-center gap-2 ml-auto">
                                                <span className="text-[10px] font-bold text-gray-400 capitalize">Custom:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="60"
                                                    value={customMonths}
                                                    onChange={(e) => setCustomMonths(parseInt(e.target.value) || 1)}
                                                    className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none text-center"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onManualRenewal(user.id, customMonths)}
                                                disabled={isUpdating}
                                                className="flex-[2] bg-blue-600 text-white text-[11px] font-black py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                                            >
                                                <Zap size={14} fill="currentColor" />
                                                UPDATE UNTIL {(() => {
                                                    const d = new Date(user.subscription_end_date && new Date(user.subscription_end_date) > new Date() ? user.subscription_end_date : new Date());
                                                    d.setMonth(d.getMonth() + customMonths);
                                                    return d.toLocaleDateString('en-GB');
                                                })()}
                                            </button>
                                            <button
                                                onClick={() => onSendRenewalReminder(user)}
                                                className="flex-1 bg-white border-2 border-amber-600 text-amber-600 text-[10px] font-black py-2.5 rounded-xl hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                                title="Send Reminder Email"
                                            >
                                                <Mail size={14} />
                                                REMINDER
                                            </button>
                                        </div>
                                    </div>

                                    {user.subscription_status === 'active' && (
                                        <button
                                            onClick={() => onCancelSubscription(user.id)}
                                            disabled={isUpdating}
                                            className="w-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-black py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={14} />
                                            CANCEL SUBSCRIPTION
                                        </button>
                                    )}
                                </div>

                                {user.manual_override_reason && (
                                    <div className="mt-4 p-2 bg-white rounded-lg border border-blue-100">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Override Reason</p>
                                        <p className="text-xs text-gray-600 italic">"{user.manual_override_reason}"</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">User ID</p>
                                <p className="text-xs font-mono text-gray-600 break-all">{user.id}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                                <p className="text-sm font-bold text-gray-900">{new Date(user.created_at).toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                className={`flex-1 py-3 font-bold rounded-xl transition-colors text-sm border ${user.is_active !== false ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}
                                onClick={onSuspend}
                            >
                                {user.is_active !== false ? 'Suspend Account' : 'Activate Account'}
                            </button>
                            {currentUser?.role === 'admin' && (
                                <button
                                    onClick={onUpdate}
                                    disabled={isUpdating}
                                    className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    {isUpdating && <Loader2 size={16} className="animate-spin" />}
                                    Save Profile Changes
                                </button>
                            )}
                            <button
                                className="flex-[1] py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
