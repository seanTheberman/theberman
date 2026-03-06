import { AlertTriangle, XCircle, CreditCard, AlertCircle } from 'lucide-react';
import type { Profile } from '../../types/admin';

export const ProfileStatusBadge = ({ profile }: { profile: Profile }) => {
    let statusLabel = profile.registration_status || (profile.is_active !== false ? 'active' : 'pending');
    let bgColor = 'bg-amber-50 text-amber-700 border-amber-200';
    let dotColor = 'bg-amber-500';

    if (profile.stripe_payment_id === 'SUSPENDED') {
        statusLabel = 'suspended' as any;
        bgColor = 'bg-red-50 text-red-700 border-red-200';
        dotColor = 'bg-red-500';
    } else if (profile.registration_status === 'active') {
        if (profile.is_active === false) {
            statusLabel = 'inactive' as any;
            bgColor = 'bg-gray-50 text-gray-700 border-gray-200';
            dotColor = 'bg-gray-500';
        } else {
            statusLabel = 'active';
            bgColor = 'bg-green-50 text-green-700 border-green-200';
            dotColor = 'bg-green-500';
        }
    } else if (profile.registration_status === 'rejected') {
        statusLabel = 'rejected';
        bgColor = 'bg-red-50 text-red-700 border-red-200';
        dotColor = 'bg-red-500';
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${bgColor}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor} ${statusLabel === 'active' ? 'animate-pulse' : ''}`} />
            {statusLabel}
        </div>
    );
};

export const LeadStatusBadge = ({ status }: { status: string }) => {
    let bgColor = 'bg-amber-50 text-amber-700 border-amber-200';
    let dotColor = 'bg-amber-500';

    if (status === 'responded' || status === 'contacted') {
        bgColor = 'bg-green-50 text-green-700 border-green-200';
        dotColor = 'bg-green-500';
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${bgColor}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {status}
        </div>
    );
};

export const PaymentStatusBadge = ({ profile }: { profile: Profile }) => {
    if (profile.stripe_payment_id === 'SUSPENDED') {
        return (
            <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase flex items-center gap-1 text-red-500">
                    <AlertTriangle size={10} /> Suspended
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 mt-0.5 select-all">
                    SUSPENDED
                </span>
            </div>
        );
    }

    if (profile.stripe_payment_id === 'CANCELLED') {
        return (
            <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase flex items-center gap-1 text-red-500">
                    <XCircle size={10} /> Cancelled
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 mt-0.5 select-all">
                    CANCELLED
                </span>
            </div>
        );
    }

    if (profile.stripe_payment_id) {
        return (
            <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase flex items-center gap-1 text-green-600">
                    <CreditCard size={10} /> Paid
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 mt-0.5 select-all" title="Stripe Payment ID">
                    {profile.stripe_payment_id}
                </span>
            </div>
        );
    }

    return (
        <span className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1">
            <AlertTriangle size={10} className="text-amber-500" /> Not Paid
        </span>
    );
};

export const SubscriptionInfo = ({ profile }: { profile: Profile }) => {
    if (profile.stripe_payment_id === 'SUSPENDED') {
        return (
            <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 p-2 rounded-lg border border-red-100">
                <AlertTriangle size={14} /> Account Suspended
            </div>
        );
    }

    const subStatus = profile.subscription_status || 'inactive';
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    const now = new Date();
    const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isExpired = daysLeft !== null && daysLeft <= 0;
    const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

    return (
        <div className="flex flex-col gap-1.5 p-2 bg-gray-50/50 rounded-lg border border-gray-100">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase w-fit ${subStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {subStatus}
            </div>
            {endDate && (
                <div className={`text-[10px] ${isExpired ? 'text-red-500 font-bold' : isExpiringSoon ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                    <span className="font-semibold">{isExpired ? 'Expired:' : 'Expires:'}</span> {endDate.toLocaleDateString('en-GB')}
                    {isExpiringSoon && !isExpired && (
                        <span className="ml-1 text-amber-500">({daysLeft}d left)</span>
                    )}
                </div>
            )}
            {isExpired && (
                <div className="flex items-center gap-1 text-[9px] text-red-600 font-black animate-pulse uppercase mt-1">
                    <AlertCircle size={10} />
                    Account Disabled
                </div>
            )}
            {!endDate && (
                <span className="text-[10px] text-gray-300 italic">No subscription</span>
            )}
        </div>
    );
};
