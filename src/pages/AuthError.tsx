
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Clock, ShieldX, ArrowLeft } from 'lucide-react';

const errorMessages: Record<string, { title: string; message: string; icon: typeof AlertTriangle }> = {
    otp_expired: {
        title: 'Link Expired',
        message: 'This password reset link has expired. Please request a new one from the login page.',
        icon: Clock,
    },
    access_denied: {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action. Please contact support if you believe this is an error.',
        icon: ShieldX,
    },
    default: {
        title: 'Something Went Wrong',
        message: 'We encountered an issue processing your request. Please try again or contact support.',
        icon: AlertTriangle,
    },
};

const AuthError = () => {
    const [searchParams] = useSearchParams();
    const errorCode = searchParams.get('error_code') || searchParams.get('error') || 'default';
    const errorDescription = searchParams.get('error_description') || '';

    const errorInfo = errorMessages[errorCode] || errorMessages.default;
    const Icon = errorInfo.icon;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Icon size={40} strokeWidth={1.5} />
                </div>

                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">
                    {errorInfo.title}
                </h1>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    {errorDescription || errorInfo.message}
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center justify-center gap-2 text-white bg-[#007F00] px-8 py-3.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-lg"
                    >
                        Request New Link
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthError;
