import { AlertTriangle, XCircle, CreditCard, AlertCircle, Clock } from 'lucide-react';
import type { Profile } from '../../types/admin';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStatusConfig = (profile: Profile) => {
    if (profile.stripe_payment_id === 'SUSPENDED')
        return { label: 'Suspended', bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
    if (profile.registration_status === 'rejected')
        return { label: 'Rejected', bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
    if (profile.registration_status === 'pending')
        return { label: 'Pending', bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
    if (profile.registration_status === 'active' && profile.is_active === false)
        return { label: 'Inactive', bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    if (profile.registration_status === 'active')
        return { label: 'Active', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500 animate-pulse' };
    return { label: 'Unknown', bg: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' };
};

// ── Main Status Badge ─────────────────────────────────────────────────────────

export const ProfileStatusBadge = ({ profile }: { profile: Profile }) => {
    const { label, bg, dot } = getStatusConfig(profile);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label}
        </span>
    );
};

// ── Compact Status Cell (replaces the cluttered 4-item stack) ─────────────────
// Shows: status badge + last login on one line + payment indicator

export const StatusCell = ({ profile, lastLogin }: { profile: Profile; lastLogin?: string | null }) => {
    const { label, bg, dot } = getStatusConfig(profile);

    const formatLogin = (ts: string | null | undefined) => {
        if (!ts) return 'Never';
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `${days}d ago`;
        return `${Math.floor(days / 30)}mo ago`;
    };

    const paymentIcon = () => {
        const pid = profile.stripe_payment_id;
        if (!pid) return <span className="text-amber-500" title="Not paid">●</span>;
        if (pid === 'SUSPENDED') return <span className="text-red-500" title="Suspended">●</span>;
        if (pid === 'CANCELLED') return <span className="text-red-400" title="Cancelled">●</span>;
        if (pid === 'MANUAL_BY_ADMIN') return <span className="text-blue-500" title="Manual admin">●</span>;
        return <span className="text-green-500" title="Paid">●</span>;
    };

    return (
        <div className="flex flex-col gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide w-fit ${bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {label}
            </span>
            <div className="flex items-center gap-2 pl-0.5">
                <div className="flex items-center gap-1 text-[9px] text-gray-400">
                    <Clock size={9} />
                    <span>{formatLogin(lastLogin || profile.last_login)}</span>
                </div>
                <span className="text-[9px]" title="Payment status">{paymentIcon()}</span>
                {(profile.role === 'contractor' || profile.role === 'business') && profile.subscription_status !== 'active' && profile.registration_status === 'active' && (
                    <span className="text-[8px] font-bold text-amber-600 uppercase bg-amber-50 px-1 rounded">No Sub</span>
                )}
            </div>
        </div>
    );
};

// ── Lead Status Badge ─────────────────────────────────────────────────────────

export const LeadStatusBadge = ({ status }: { status: string }) => {
    const isContacted = status === 'responded' || status === 'contacted';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isContacted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isContacted ? 'bg-green-500' : 'bg-amber-500'}`} />
            {status}
        </span>
    );
};

// ── Payment Badge (simple inline) ─────────────────────────────────────────────

export const PaymentStatusBadge = ({ profile }: { profile: Profile }) => {
    const pid = profile.stripe_payment_id;
    if (!pid)
        return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600"><AlertTriangle size={9} /> Not Paid</span>;
    if (pid === 'SUSPENDED')
        return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600"><XCircle size={9} /> Suspended</span>;
    if (pid === 'CANCELLED')
        return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-500"><XCircle size={9} /> Cancelled</span>;
    if (pid === 'MANUAL_BY_ADMIN')
        return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600"><CreditCard size={9} /> Manual</span>;
    return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600"><CreditCard size={9} /> Paid</span>;
};

// ── Subscription Info (for businesses) ───────────────────────────────────────

export const SubscriptionInfo = ({ profile }: { profile: Profile }) => {
    const sub = profile.subscription_status || 'inactive';
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    const now = new Date();
    const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isExpired = daysLeft !== null && daysLeft <= 0;
    const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

    if (profile.stripe_payment_id === 'SUSPENDED')
        return <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={12} /> Suspended</span>;

    return (
        <div className="flex flex-col gap-0.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase w-fit ${sub === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {sub}
            </span>
            {endDate ? (
                <span className={`text-[10px] ${isExpired ? 'text-red-500 font-bold' : isExpiringSoon ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                    {isExpired ? 'Expired' : 'Expires'}: {endDate.toLocaleDateString('en-GB')}
                    {isExpiringSoon && !isExpired && <span className="ml-1 text-amber-500">({daysLeft}d)</span>}
                </span>
            ) : (
                <span className="text-[10px] text-gray-300 italic">No subscription</span>
            )}
            {isExpired && (
                <span className="flex items-center gap-1 text-[9px] text-red-500 font-bold uppercase">
                    <AlertCircle size={9} /> Disabled
                </span>
            )}
        </div>
    );
};
